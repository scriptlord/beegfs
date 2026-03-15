import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { wsService } from '../services/websocket';
import type { ClusterEvent } from '../types';
import EventLog from '../components/EventLog';

export default function Events() {
  const [events, setEvents] = useState<ClusterEvent[]>([]);
  const knownIds = useRef(new Set<string>());
  const [newEventIds, setNewEventIds] = useState(new Set<string>());

  useEffect(() => {
    api.getEvents().then((data) => {
      setEvents(data);
      data.forEach((e) => knownIds.current.add(e.id));
    }).catch(() => {});

    const unsub = wsService.subscribe('event:new', (evt: ClusterEvent) => {
      setEvents((prev) => [evt, ...prev].slice(0, 200));
      if (!knownIds.current.has(evt.id)) {
        setNewEventIds((prev) => new Set(prev).add(evt.id));
        setTimeout(() => {
          setNewEventIds((prev) => {
            const next = new Set(prev);
            next.delete(evt.id);
            return next;
          });
        }, 2000);
      }
      knownIds.current.add(evt.id);
    });

    return unsub;
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>System Events</h2>
      <EventLog events={events} newEventIds={newEventIds} />
    </div>
  );
}
