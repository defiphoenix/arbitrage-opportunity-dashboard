import { useState, useEffect, useRef, useCallback } from 'react';
import { ArbOpportunity, ConnectionStatus, ServerStatus, WSServerMessage } from '../types';

export function useArbWebSocket() {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [opportunities, setOpportunities] = useState<ArbOpportunity[]>([]);
  const [newOppIds, setNewOppIds] = useState<Set<string>>(new Set());
  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    connectedClients: 1,
    totalOpportunitiesReceived: 0,
    simulationEnabled: true,
    simulationIntervalMs: 1200,
    uptimeSeconds: 0,
  });
  const [latencyMs, setLatencyMs] = useState<number>(0);
  const pingStartRef = useRef<number>(0);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getWsUrl = useCallback(() => {
    return 'wss://arbiris--arbiris-demo--97snh9sqrrjn.code.run/ws';
  }, []);

  // Merge incoming opportunities with existing state, dedupe by id, newest first, cap 500
  const mergeOpportunities = useCallback((incoming: ArbOpportunity[]) => {
    if (!incoming.length) return;
    setOpportunities((prev) => {
      const seen = new Set(prev.map((o) => o.id));
      const fresh = incoming.filter((o) => o.id && !seen.has(o.id));
      if (!fresh.length) return prev;
      const next = [...prev, ...fresh].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      if (next.length > 500) next.length = 500;
      return next;
    });
  }, []);

  // Load buffered opportunities from the REST API (page host) before the WS connects
  const fetchInitialOpportunities = useCallback(async () => {
    try {
      const res = await fetch('/opportunities?limit=500');
      if (!res.ok) return;
      const body = await res.json();
      if (Array.isArray(body.data)) mergeOpportunities(body.data);
      if (body.status) setServerStatus(body.status);
    } catch (e) {
      console.warn('Initial REST fetch failed:', e);
    }
  }, [mergeOpportunities]);

  const connect = useCallback(() => {
    try {
      if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
        return;
      }

      setStatus('connecting');
      const wsUrl = getWsUrl();
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setStatus('connected');
        // Measure ping latency
        pingStartRef.current = Date.now();
        ws.send(JSON.stringify({ type: 'ping' }));
      };

      ws.onmessage = (event) => {
        try {
          const msg: WSServerMessage = JSON.parse(event.data);

          if (msg.type === 'pong') {
            if (pingStartRef.current) {
              setLatencyMs(Date.now() - pingStartRef.current);
            }
            return;
          }

          if (msg.type === 'initial_state') {
            // Merge (not replace) so REST-preloaded opportunities survive
            mergeOpportunities(msg.opportunities || []);
            if (msg.status) setServerStatus(msg.status);
            return;
          }

          if (msg.type === 'hello') {
            // External bot endpoint sends connection history on handshake
            mergeOpportunities(msg.data?.history || []);
            return;
          }

          if (msg.type === 'arb_opportunity' && msg.data) {
            const newOpp = msg.data;
            setOpportunities((prev) => {
              // Idempotency check
              if (prev.some((item) => item.id === newOpp.id)) {
                return prev;
              }
              const next = [newOpp, ...prev];
              if (next.length > 500) next.length = 500;
              return next;
            });

            // Set new item highlight tag
            setNewOppIds((prev) => {
              const updated = new Set(prev);
              updated.add(newOpp.id);
              return updated;
            });

            // Remove highlight after 2.5s
            setTimeout(() => {
              setNewOppIds((prev) => {
                const updated = new Set(prev);
                updated.delete(newOpp.id);
                return updated;
              });
            }, 2500);

            return;
          }

          if (msg.type === 'status_update' && msg.status) {
            setServerStatus(msg.status);
            return;
          }

          if (msg.type === 'cleared') {
            setOpportunities([]);
            setNewOppIds(new Set());
            return;
          }
        } catch (e) {
          console.error('WS parse error:', e);
        }
      };

      ws.onerror = (err) => {
        console.warn('WS error on', wsUrl, err);
      };

      ws.onclose = () => {
        setStatus('disconnected');
        socketRef.current = null;
        // Schedule auto reconnect
        reconnectTimeoutRef.current = setTimeout(() => {
          setStatus('reconnecting');
          connect();
        }, 2000);
      };
    } catch (e) {
      console.error('Failed to create WebSocket:', e);
      setStatus('disconnected');
      reconnectTimeoutRef.current = setTimeout(() => connect(), 2000);
    }
  }, [getWsUrl, mergeOpportunities]);

  useEffect(() => {
    let cancelled = false;

    // Hydrate from REST first, then open the WebSocket for live updates
    fetchInitialOpportunities().finally(() => {
      if (!cancelled) connect();
    });

    // Ping interval to keep alive & measure latency
    const interval = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        pingStartRef.current = Date.now();
        socketRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 10000);

    return () => {
      cancelled = true;
      clearInterval(interval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect, fetchInitialOpportunities]);

  const clearOpportunities = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'clear' }));
    } else {
      setOpportunities([]);
    }
  }, []);

  const toggleSimulation = useCallback((enabled: boolean) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'simulation_toggle', enabled }));
    }
  }, []);

  const setSimulationSpeed = useCallback((intervalMs: number) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'simulation_speed', intervalMs }));
    }
  }, []);

  const postOpportunity = useCallback((opp: ArbOpportunity) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'post_opportunity', opportunity: opp }));
    }
  }, []);

  return {
    status,
    latencyMs,
    opportunities,
    newOppIds,
    serverStatus,
    clearOpportunities,
    toggleSimulation,
    setSimulationSpeed,
    postOpportunity,
    reconnect: connect,
  };
}
