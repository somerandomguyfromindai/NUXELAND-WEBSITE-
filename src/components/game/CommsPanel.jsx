import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Hash, Lock, Radio, AlertTriangle, Shield, Globe, Zap, Bell, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function CommsPanel({ gameState }) {
  const [selectedChannel, setSelectedChannel] = useState("#general");
  const [timedMessages, setTimedMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const { data: messages } = useQuery({
    queryKey: ['commmessages'],
    queryFn: () => base44.entities.CommMessage.list(),
    initialData: [],
  });

  const { data: missions } = useQuery({
    queryKey: ['missions'],
    queryFn: () => base44.entities.Mission.list(),
    initialData: [],
  });

  useEffect(() => {
    // Simulate timed messages based on mission progress
    const timer = setInterval(() => {
      const now = new Date();
      const completedCount = missions.filter(m => m.status === 'completed').length;
      
      // Add timed alerts based on game state
      if (completedCount >= 1 && !timedMessages.find(m => m.id === 'alert-1')) {
        setTimedMessages(prev => [...prev, {
          id: 'alert-1',
          type: 'critical',
          message: 'Mission 1 complete. New channels unlocked.',
          timestamp: now,
          channel: 'SYSTEM'
        }]);
        
        setNotifications(prev => [...prev, {
          id: 'notif-1',
          text: 'New channel available: #project_tindalos',
          read: false
        }]);
      }
      
      if (completedCount >= 2 && !timedMessages.find(m => m.id === 'alert-2')) {
        setTimedMessages(prev => [...prev, {
          id: 'alert-2',
          type: 'warning',
          message: 'Bio-stress levels elevated. Agent Pip requires attention.',
          timestamp: now,
          channel: 'SYSTEM'
        }]);
        
        setNotifications(prev => [...prev, {
          id: 'notif-2',
          text: 'Warning: Bio-stress detected',
          read: false
        }]);
      }

      if (completedCount >= 3 && !timedMessages.find(m => m.id === 'alert-3')) {
        setTimedMessages(prev => [...prev, {
          id: 'alert-3',
          type: 'success',
          message: 'All field operations complete. Final protocol initiated.',
          timestamp: now,
          channel: 'SYSTEM'
        }]);
        
        setNotifications(prev => [...prev, {
          id: 'notif-3',
          text: 'Final Choice available',
          read: false
        }]);
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [missions, timedMessages]);

  const channelTypes = {
    '#general': { icon: Hash, type: 'standard', color: 'text-gray-400', description: 'General communications' },
    '#project_tindalos': { icon: Shield, type: 'secure', color: 'text-blue-400', description: 'Secure internal comms' },
    '#field_ops': { icon: Radio, type: 'secure', color: 'text-green-400', description: 'Field operations channel' },
    '#research': { icon: Zap, type: 'encrypted', color: 'text-purple-400', description: 'Research division' },
    '#public_broadcast': { icon: Globe, type: 'public', color: 'text-yellow-400', description: 'Public communications' },
    'SYSTEM': { icon: AlertTriangle, type: 'system', color: 'text-red-400', description: 'System alerts' }
  };

  const channels = [...new Set([
    ...messages.map(m => m.channel),
    'SYSTEM'
  ])];

  const channelMessages = messages.filter(m => 
    m.channel === selectedChannel &&
    (!m.unlock_requirement || gameState.completedMissions.includes(m.unlock_requirement))
  );

  const systemMessages = timedMessages.filter(m => m.channel === selectedChannel);

  const allMessages = [
    ...channelMessages.map(m => ({ ...m, type: 'user', time: m.timestamp || m.created_date })),
    ...systemMessages.map(m => ({ ...m, type: 'system', time: m.timestamp }))
  ].sort((a, b) => new Date(a.time) - new Date(b.time));

  const isChannelLocked = (channel) => {
    if (channel === 'SYSTEM' || channel === '#general') return false;
    const channelMsgs = messages.filter(m => m.channel === channel);
    return channelMsgs.length > 0 && 
           channelMsgs.some(m => m.channel_locked && 
           m.unlock_requirement && 
           !gameState.completedMissions.includes(m.unlock_requirement));
  };

  const getChannelInfo = (channel) => {
    return channelTypes[channel] || { icon: Hash, type: 'standard', color: 'text-gray-400', description: 'Channel' };
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="grid lg:grid-cols-4 gap-4 p-6">
      {/* Channel List */}
      <div className="bg-[#0A0E1A] rounded-lg border border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-mono font-bold">CHANNELS</h3>
          {unreadCount > 0 && (
            <Badge className="bg-red-500/20 text-red-400 text-xs animate-pulse">
              {unreadCount} new
            </Badge>
          )}
        </div>
        <div className="space-y-2">
          {channels.map(channel => {
            const locked = isChannelLocked(channel);
            const info = getChannelInfo(channel);
            const Icon = info.icon;
            const hasUnread = notifications.some(n => !n.read && n.text.includes(channel));
            
            return (
              <button
                key={channel}
                onClick={() => !locked && setSelectedChannel(channel)}
                disabled={locked}
                className={`w-full text-left px-3 py-2 rounded font-mono text-sm transition-colors ${
                  selectedChannel === channel && !locked
                    ? 'bg-green-900/30 border border-green-500/50'
                    : locked
                    ? 'text-gray-600 cursor-not-allowed border border-gray-800'
                    : 'text-gray-400 hover:bg-gray-800 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {locked ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <Icon className={`w-4 h-4 ${info.color}`} />
                  )}
                  <span className="flex-1">{channel.replace('#', '')}</span>
                  {hasUnread && !locked && (
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  )}
                </div>
                <p className="text-xs text-gray-600 ml-6">{info.description}</p>
                {info.type !== 'standard' && !locked && (
                  <Badge className="mt-1 ml-6 text-xs" variant="outline">
                    {info.type}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* Notifications Panel */}
        {notifications.length > 0 && (
          <div className="mt-6 border-t border-gray-700 pt-4">
            <h4 className="text-white font-mono font-bold text-sm mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-yellow-400" />
              ALERTS
            </h4>
            <div className="space-y-2">
              {notifications.slice(-5).reverse().map(notif => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`p-2 rounded text-xs font-mono cursor-pointer transition-colors ${
                    notif.read 
                      ? 'bg-gray-800/30 text-gray-600'
                      : 'bg-yellow-900/20 border border-yellow-500/30 text-yellow-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {notif.read ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <Bell className="w-3 h-3 animate-pulse" />
                    )}
                    <span className="flex-1">{notif.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="lg:col-span-3 bg-[#0A0E1A] rounded-lg border border-gray-700 p-4">
        <div className="border-b border-gray-700 pb-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            {React.createElement(getChannelInfo(selectedChannel).icon, {
              className: `w-5 h-5 ${getChannelInfo(selectedChannel).color}`
            })}
            <h3 className="text-white font-mono font-bold flex-1">
              {selectedChannel.replace('#', '')}
            </h3>
            {getChannelInfo(selectedChannel).type !== 'standard' && (
              <Badge className={`text-xs ${
                getChannelInfo(selectedChannel).type === 'secure' ? 'bg-blue-500/20 text-blue-400' :
                getChannelInfo(selectedChannel).type === 'encrypted' ? 'bg-purple-500/20 text-purple-400' :
                getChannelInfo(selectedChannel).type === 'public' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {getChannelInfo(selectedChannel).type}
              </Badge>
            )}
          </div>
          <p className="text-gray-500 font-mono text-xs">
            {getChannelInfo(selectedChannel).description}
          </p>
        </div>

        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {allMessages.length > 0 ? (
            allMessages.map((msg, i) => (
              <div 
                key={i} 
                className={`rounded-lg p-3 ${
                  msg.type === 'system' 
                    ? msg.message.includes('complete') || msg.message.includes('success')
                      ? 'bg-green-900/20 border border-green-500/30'
                      : msg.message.includes('Warning') || msg.message.includes('elevated')
                      ? 'bg-yellow-900/20 border border-yellow-500/30'
                      : 'bg-red-900/20 border border-red-500/30'
                    : 'border-l-2 border-gray-700 pl-4'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {msg.type === 'system' && (
                    <AlertTriangle className={`w-4 h-4 ${
                      msg.message.includes('complete') ? 'text-green-400' :
                      msg.message.includes('Warning') ? 'text-yellow-400' :
                      'text-red-400'
                    }`} />
                  )}
                  <span className={`font-mono font-bold text-sm ${
                    msg.type === 'system' 
                      ? msg.message.includes('complete') ? 'text-green-400' :
                        msg.message.includes('Warning') ? 'text-yellow-400' :
                        'text-red-400'
                      : 'text-white'
                  }`}>
                    {msg.type === 'system' ? 'SYSTEM' : msg.sender}
                  </span>
                  <span className="text-gray-600 font-mono text-xs">
                    {msg.type === 'system' 
                      ? format(new Date(msg.time), 'HH:mm:ss')
                      : msg.timestamp || format(new Date(msg.time), 'HH:mm')
                    }
                  </span>
                  {msg.type === 'system' && (
                    <Badge className="ml-auto text-xs bg-red-500/20 text-red-400">
                      ALERT
                    </Badge>
                  )}
                </div>
                <p className={`font-mono text-sm leading-relaxed ${
                  msg.type === 'system'
                    ? msg.message.includes('complete') ? 'text-green-300' :
                      msg.message.includes('Warning') ? 'text-yellow-300' :
                      'text-red-300'
                    : 'text-gray-300'
                }`}>
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