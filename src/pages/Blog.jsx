import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { FileText, ThumbsUp, MessageCircle, Plus, User, Calendar } from "lucide-react";

export default function Blog() {
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' });
  const queryClient = useQueryClient();

  const { data: posts } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => base44.entities.ForumPost.list(),
    initialData: [],
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const createPostMutation = useMutation({
    mutationFn: (postData) => base44.entities.ForumPost.create(postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      setNewPost({ title: '', content: '', category: 'general' });
      setShowNewPost(false);
    },
  });

  const likePostMutation = useMutation({
    mutationFn: ({ id, currentLikes }) => 
      base44.entities.ForumPost.update(id, { likes: currentLikes + 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });

  const categoryConfig = {
    technology: { color: 'bg-blue-500/20 text-blue-400', icon: '💻' },
    nature: { color: 'bg-green-500/20 text-green-400', icon: '🌿' },
    ethics: { color: 'bg-gray-500/20 text-gray-400', icon: '⚖️' },
    general: { color: 'bg-purple-500/20 text-purple-400', icon: '📰' },
  };

  const sortedPosts = [...posts].sort((a, b) => 
    new Date(b.created_date) - new Date(a.created_date)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E1A] via-[#1a1f3a] to-[#0A0E1A] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white font-mono flex items-center gap-3">
                <FileText className="w-10 h-10 text-cyan-400" />
                NUXELAND BLOG
              </h1>
              <p className="text-gray-400 font-mono text-sm mt-2">
                Latest news, discoveries, and insights from the miniaturization frontier
              </p>
            </div>
            {user && (
              <Button
                onClick={() => setShowNewPost(!showNewPost)}
                className="bg-cyan-600 hover:bg-cyan-700 font-mono"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            )}
          </div>

          {showNewPost && (
            <Card className="bg-[#0F1729] border-cyan-500/50 mb-6">
              <CardHeader>
                <CardTitle className="text-cyan-400 font-mono">Create Blog Post</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Post Title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="bg-black/30 border-gray-700 text-white"
                />
                <Textarea
                  placeholder="Share your thoughts..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="bg-black/30 border-gray-700 text-white h-32"
                />
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  className="w-full p-2 rounded bg-black/30 border border-gray-700 text-white font-mono"
                >
                  <option value="general">General</option>
                  <option value="technology">Technology</option>
                  <option value="nature">Nature</option>
                  <option value="ethics">Ethics</option>
                </select>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowNewPost(false)}
                    variant="outline"
                    className="flex-1 font-mono"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => createPostMutation.mutate(newPost)}
                    disabled={!newPost.title || !newPost.content}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 font-mono"
                  >
                    Publish
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {sortedPosts.map((post) => {
            const categoryStyle = categoryConfig[post.category] || categoryConfig.general;
            return (
              <Card key={post.id} className="bg-[#0F1729] border-gray-700 hover:border-cyan-500/50 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={categoryStyle.color}>
                          {categoryStyle.icon} {post.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-white font-mono text-xl mb-2">
                        {post.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-400 font-mono">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {post.created_by || 'Anonymous'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(post.created_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4 whitespace-pre-wrap">{post.content}</p>
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
                    <Button
                      onClick={() => likePostMutation.mutate({ id: post.id, currentLikes: post.likes || 0 })}
                      variant="ghost"
                      className="text-gray-400 hover:text-cyan-400 font-mono"
                      size="sm"
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      {post.likes || 0}
                    </Button>
                    <div className="flex items-center gap-2 text-gray-400 font-mono text-sm">
                      <MessageCircle className="w-4 h-4" />
                      {post.replies?.length || 0} comments
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {sortedPosts.length === 0 && (
            <Card className="bg-[#0F1729] border-gray-700">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 font-mono">No blog posts yet. Be the first to share!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}