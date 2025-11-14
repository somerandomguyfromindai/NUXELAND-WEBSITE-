import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Hash, Lock } from "lucide-react";
import { format } from "date-fns";

export default function CommsPanel({ gameState }) {
  const [selectedChannel, setSelectedChannel] = useState("#general");

  const { data: messages } = useQuery({
    queryKey: ['commmessages'],
    queryFn: () => base44.entities.CommMessage.list(),
    initialData: [],
  });

  const channels = [...new Set(messages.map(m => m.channel))];
  const channelMessages = messages.filter(m => 
    m.channel === selectedChannel &&
    (!m.unlock_requirement || gameState.completedMissions.includes(m.unlock_requirement))
  );

  const isChannelLocked = (channel) => {
    const channelMsgs = messages.filter(m => m.channel === channel);
    return channelMsgs.length > 0 && 
           channelMsgs.some(m => m.channel_locked && 
           m.unlock_requirement && 
           !gameState.completedMissions.includes(m.unlock_requirement));
  };

  return (
    <div className="grid lg:grid-cols-4 gap-4 p-6">
      {/* Channel List */}
      <div className="bg-[#0A0E1A] rounded-lg border border-gray-700 p-4">
        <h3 className="text-white font-mono font-bold mb-4">CHANNELS</h3>
        <div className="space-y-2">
          {channels.map(channel => {
            const locked = isChannelLocked(channel);
            return (
              <button
                key={channel}
                onClick={() => !locked && setSelectedChannel(channel)}
                disabled={locked}
                className={`w-full text-left px-3 py-2 rounded font-mono text-sm flex items-center gap-2 transition-colors ${
                  selectedChannel === channel && !locked
                    ? 'bg-green-900/30 text-green-400 border border-green-500/50'
                    : locked
                    ? 'text-gray-600 cursor-not-allowed border border-gray-800'
                    : 'text-gray-400 hover:bg-gray-800 border border-transparent'
                }`}
              >
                {locked ? <Lock className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
                <span>{channel.replace('#', '')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="lg:col-span-3 bg-[#0A0E1A] rounded-lg border border-gray-700 p-4">
        <div className="border-b border-gray-700 pb-3 mb-4">
          <h3 className="text-white font-mono font-bold flex items-center gap-2">
            <Hash className="w-5 h-5 text-green-400" />
            {selectedChannel.replace('#', '')}
          </h3>
          <p className="text-gray-500 font-mono text-xs">Internal Communications</p>
        </div>

        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {channelMessages.length > 0 ? (
            channelMessages.map((msg, i) => (
              <div key={i} className="border-l-2 border-gray-700 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-mono font-bold text-sm">
                    {msg.sender}
                  </span>
                  <span className="text-gray-600 font-mono text-xs">
                    {msg.timestamp || format(new Date(msg.created_date), 'HH:mm')}
                  </span>
                </div>
                <p className="text-gray-300 font-mono text-sm leading-relaxed">
                  {msg.message}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Lock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 font-mono text-sm">
                {isChannelLocked(selectedChannel) 
                  ? 'CHANNEL LOCKED - Complete missions to unlock'
                  : 'No messages in this channel'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}