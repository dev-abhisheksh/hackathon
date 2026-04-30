const TicketQueue = ({ tickets, selectedTicket, onSelect }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
        <h2 className="font-semibold text-lg">Ticket Queue</h2>
        <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">{tickets.length}</span>
      </div>
      <div className="overflow-y-auto p-4 flex-1">
        {tickets.length === 0 ? (
          <p className="text-gray-500 text-center text-sm mt-10">No tickets in queue.</p>
        ) : (
          tickets.map(ticket => (
            <div 
              key={ticket._id} 
              onClick={() => onSelect(ticket._id)}
              className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition ${selectedTicket === ticket._id ? "bg-blue-50 border-blue-500 border-l-4" : ""}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-sm truncate">{ticket.subject}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                  ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                  ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {ticket.priority}
                </span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-500 truncate">{ticket.customerId?.name || 'Customer'}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${ticket.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {ticket.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TicketQueue;
