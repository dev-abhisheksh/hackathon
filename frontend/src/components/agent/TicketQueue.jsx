import React from "react";

const TicketQueue = ({ tickets, selectedTicket, onSelect }) => {
  return (
    <div className="flex flex-col h-full bg-white font-sans overflow-hidden">
      {/* Search/Header area could go here, but keeping it minimal as requested */}
      <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 opacity-40">
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Queue Empty</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket._id}
              onClick={() => onSelect(ticket._id)}
              className={`p-4 cursor-pointer transition-all border-l-2 relative ${selectedTicket === ticket._id
                  ? "bg-slate-50 border-slate-900"
                  : "border-transparent hover:bg-gray-50 hover:border-gray-200"
                }`}
            >
              <div className="flex justify-between items-start gap-2 mb-2">
                <span className={`text-[11px] font-bold leading-tight ${selectedTicket === ticket._id ? "text-slate-900" : "text-gray-700"
                  }`}>
                  {ticket.subject}
                </span>
                <span className={`shrink-0 text-[8px] px-1.5 py-0.5 font-black uppercase tracking-tighter rounded-sm border ${ticket.priority === 'urgent'
                    ? 'bg-red-50 text-red-600 border-red-100'
                    : 'bg-gray-50 text-gray-400 border-gray-200'
                  }`}>
                  {ticket.priority}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-4 h-4 bg-gray-200 rounded-sm flex items-center justify-center text-[8px] font-bold text-gray-500 shrink-0 uppercase">
                    {(ticket.customerId?.name || 'C').charAt(0)}
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium truncate uppercase tracking-tight">
                    {ticket.customerId?.name || 'Unknown User'}
                  </span>
                </div>

                <span className={`text-[9px] font-black uppercase tracking-widest ${ticket.status === 'open' ? 'text-emerald-500' : 'text-gray-400'
                  }`}>
                  {ticket.status}
                </span>
              </div>

              {/* Selection Indicator Dot */}
              {selectedTicket === ticket._id && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-slate-900 rounded-l-full" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TicketQueue;