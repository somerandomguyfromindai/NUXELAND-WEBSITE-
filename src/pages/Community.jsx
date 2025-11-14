import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, ThumbsUp, Send, Users } from "lucide-react";
import { format } from "date-fns";

export default function Community() {
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "general" });
  const [showNewPost, setShowNewPost] = useState(false);
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['forum-posts'],
    queryFn: () => base44.entities.ForumPost.list('-created_date'),
    initialData: [],
  });

  const createPostMutation = useMutation({
    mutationFn: (data) => base44.entities.ForumPost.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
      setShowNewPost(false);
      setNewPost({ title: "", content: "", category: "general" });
    },
  });

  const likePostMutation = useMutation({
    mutationFn: ({ id, likes }) => base44.entities.ForumPost.update(id, { likes: likes + 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
    },
  });

  const categoryColors = {
    technology: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: '🔵' },
    nature: { bg: 'bg-green-500/20', text: 'text-green-400', icon: '🟢' },
    ethics: { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: '⚪' },
    general: { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: '💬' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E1A] to-[#0F1729] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center gap-3">
            <Users className="w-10 h-10" />
            Community Forum
          </h1>
          <p className="text-xl text-gray-400">
            Share insights and collaborate with fellow researchers
          </p>
        </div>

        {/* New Post Button */}
        <div className="mb-6">
          <Button
            onClick={() => setShowNewPost(!showNewPost)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
          >
            <Send className="w-4 h-4 mr-2" />
            {showNewPost ? 'Cancel' : 'Create New Post'}
          </Button>
        </div>

        {/* New Post Form */}
        {showNewPost && (
          <Card className="mb-6 bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">New Discussion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  placeholder="Post title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Textarea
                  placeholder="Share your thoughts..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={4}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Select
                  value={newPost.category}
                  onValueChange={(value) => setNewPost({ ...newPost, category: value })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1F2E] border-white/10">
                    <SelectItem value="general">💬 General Discussion</SelectItem>
                    <SelectItem value="technology">🔵 Technology</SelectItem>
                    <SelectItem value="nature">🟢 Nature</SelectItem>
                    <SelectItem value="ethics">⚪ Ethics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => createPostMutation.mutate(newPost)}
                disabled={!newPost.title || !newPost.content}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400"
              >
                Post Discussion
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Posts List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : posts.length === 0 ? (
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No discussions yet. Be the first to post!</p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => {
              const colors = categoryColors[post.category];
              return (
                <Card key={post.id} className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-white text-xl mb-2">
                          {post.title}
                        </CardTitle>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span>{post.created_by}</span>
                          <span>•</span>
                          <span>{format(new Date(post.created_date), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                      <Badge className={`${colors.bg} ${colors.text} border-0`}>
                        {colors.icon} {post.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4">{post.content}</p>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => likePostMutation.mutate({ id: post.id, likes: post.likes || 0 })}
                        className="text-gray-400 hover:text-blue-400 hover:bg-blue-500/10"
                      >
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        {post.likes || 0} Likes
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-green-400 hover:bg-green-500/10"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {post.replies?.length || 0} Replies
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}