import React from 'react';
import { usePage } from '@inertiajs/react';
import { FileTextIcon } from 'lucide-react';

type Conversation = { id: number; name: string; last: string };
type Message = { id: number; text: string; from_me: boolean; created_at: string };

export default function ChatWidget() {
  const [open, setOpen] = React.useState(false);
  const [convos, setConvos] = React.useState<Conversation[]>([]);
  const [active, setActive] = React.useState<number | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [draft, setDraft] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const { props } = usePage();

  React.useEffect(() => {
        if (!open) return;
        fetch('/conversations', { headers: { 'Accept': 'application/json' }, credentials: 'same-origin' })
          .then(r => r.json()).then(setConvos).catch(() => setConvos([]));
    }, [open]);

  // If the server sets open_chat (redirect after creating conversation), open widget and set active.
  React.useEffect(() => {
    const openChat = props.open_chat ?? null;
    if (openChat) {
      setOpen(true);
      setActive(Number(openChat));
    }
  }, [props.open_chat]);

  // Whenever `active` changes, load messages for that conversation.
  React.useEffect(() => {
    if (!active) {
      setDraft(''); // clear draft when no convo selected
      setMessages([]);
      return;
    }

    // ensure widget is open when selecting a conversation programmatically
    setOpen(true);

    fetch(`/conversations/${active}/messages`, { headers: { 'Accept': 'application/json' }, credentials: 'same-origin' })
      .then(r => {
        if (!r.ok) throw new Error('Failed to load messages');
        return r.json();
      })
      .then((data: Message[]) => {
        setMessages(data);
        // focus after messages loaded
        setTimeout(() => inputRef.current?.focus(), 50);
      })
      .catch(() => {
        setMessages([]);
      });
  }, [active]);

    async function send() {
        if (!active || !draft.trim()) return;
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
        try {
            const res = await fetch(`/conversations/${active}/send`, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token,
                },
                body: JSON.stringify({ text: draft }),
            });
            if (!res.ok) {
                // optional: handle validation errors here
                return;
            }
            const json = await res.json();
            setDraft('');
            setMessages(prev => [...prev, json]);
        } catch (e) {
            // network / unexpected error
        }
    }

    return (
        <>
        {/* floating bubble */}
        <button
            onClick={() => setOpen(v => !v)}
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center"
            aria-label="Open chat"
        >
            💬
        </button>

        {/* panel */}
        {open && (
            <div className="fixed bottom-20 right-6 z-50 w-[22rem] md:w-[34rem] h-[60vh] bg-white rounded-lg shadow-xl outline-1 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-2 border-b">
                    <div className="font-semibold">Messages</div>
                    <button onClick={() => setOpen(false)} className="px-2">✕</button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* left: conversations */}
                    <div className="w-1/3 min-w-[120px] border-r overflow-auto">
                    {convos.map(c => (
                        <button
                        key={c.id}
                        onClick={() => setActive(c.id)}
                        className={`w-full text-left p-3 hover:bg-gray-100 ${active === c.id ? 'bg-gray-100' : ''}`}
                        >
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-gray-500 truncate">{c.last}</div>
                        </button>
                    ))}
                    </div>

                    {/* right: chat window */}
                    <div className="flex-1 flex flex-col">
                        <div className="flex-1 p-3 overflow-auto space-y-2 bg-gray-50">
                            {messages.map(m => (
                            <div key={m.id} className={`max-w-[80%] p-2 rounded-md ${m.from_me ? 'bg-blue-500 text-white self-end' : 'bg-white text-gray-800 self-start'}`}>
                                <div className="text-sm">{m.text}</div>
                                <div className="text-[10px] text-gray-400 mt-1">{new Date(m.created_at).toLocaleTimeString()}</div>
                            </div>
                            ))}
                        </div>

                        {active ? (
                        <div className="p-2 border-t flex gap-2">
                            <input ref={inputRef} value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Type a message..." className="flex-1 px-3 py-2 border rounded-md" />
                            <button onClick={send} className="px-3 py-2 bg-blue-600 text-white rounded-md">Send</button>
                        </div>
                        ) : (
                        <div className="p-3 border-t text-sm text-gray-500">Select a conversation to start chatting</div>
                        )}
                    </div>
                </div>
            </div>
        )}
        </>
    );
}