import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Calendar, Heart, MessageCircle, Target, Award } from 'lucide-react';
import { toast } from 'sonner';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAccess } from '@/hooks/useAccess';
import QuickFeedback from "@/components/feedback/QuickFeedback";
import FeedbackModal from "@/components/feedback/FeedbackModal";

interface SparkCircle {
  id: string;
  name: string;
  description: string;
  max_members: number;
  is_private: boolean;
  creator_id: string;
  created_at: string;
  memberships: Array<{
    user_id: string;
    role: string;
    profiles: {
      display_name: string;
    };
  }>;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'ai_led' | 'peer_led';
  duration_days: number;
  start_date: string;
  end_date: string;
  creator_id: string;
  participations: Array<{
    user_id: string;
    progress: number;
  }>;
}

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  post_type: 'win' | 'prayer_request' | 'testimony' | 'reflection';
  created_at: string;
  authorDisplayName: string;
  reactions: Array<{
    reaction_type: string;
    user_id: string;
  }>;
}

const Community = () => {
  const { user } = useAuth();
const { profile, loading: profileLoading } = useUserProfile(user?.id);
  const { fullAccess } = useAccess();
  const [circles, setCircles] = useState<SparkCircle[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newCircleName, setNewCircleName] = useState('');
  const [newCircleDesc, setNewCircleDesc] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<'win' | 'prayer_request' | 'testimony' | 'reflection'>('win');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

useEffect(() => {
  if (!user) return;
  if (profileLoading) return;
  fetchCommunityData();
}, [user, profileLoading]);

  const fetchCommunityData = async () => {
    if (!user) return;
    setLoading(true);

    // Fetch Spark Circles
    try {
      const { data: circlesData } = await supabase
        .from('spark_circles')
        .select(`
          *,
          circle_memberships!circle_id(
            user_id,
            role
          )
        `)
        .order('created_at', { ascending: false });

      const transformedCircles = (circlesData || []).map(circle => ({
        ...circle,
        memberships: (circle.circle_memberships || []).map(m => ({
          ...m,
          profiles: { display_name: 'Member' }
        }))
      }));
      setCircles(transformedCircles);
    } catch (err) {
      console.error('Circles load error:', err);
    }

    // Fetch Challenges
    try {
      const { data: challengesData } = await supabase
        .from('challenges')
        .select(`
          *,
          challenge_participations!challenge_id(user_id, progress)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      const transformedChallenges = (challengesData || []).map(challenge => ({
        ...challenge,
        type: challenge.type as 'ai_led' | 'peer_led',
        participations: challenge.challenge_participations || []
      }));
      setChallenges(transformedChallenges);
    } catch (err) {
      console.error('Challenges load error:', err);
    }

    // Fetch Posts (Feed)
    try {
      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          *,
          post_reactions!post_id(reaction_type, user_id)
        `)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(20);

      const transformedPosts = (postsData || []).map(post => ({
        ...post,
        post_type: post.post_type as 'win' | 'prayer_request' | 'testimony' | 'reflection',
        authorDisplayName: 'Anonymous',
        reactions: post.post_reactions || []
      }));
      setPosts(transformedPosts);
    } catch (err) {
      console.error('Posts load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCircle = async () => {
    if (!user || !newCircleName.trim()) return;
    if (!fullAccess) {
      toast.error('Join via your organization to create circles');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('spark_circles')
        .insert({
          name: newCircleName,
          description: newCircleDesc,
          creator_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as admin member
      await supabase
        .from('circle_memberships')
        .insert({
          circle_id: data.id,
          user_id: user.id,
          role: 'admin'
        });

      setNewCircleName('');
      setNewCircleDesc('');
      fetchCommunityData();
      toast.success('Spark Circle created!');
    } catch (error) {
      console.error('Error creating circle:', error);
      toast.error('Failed to create circle');
    }
  };

  const joinCircle = async (circleId: string) => {
    if (!user) return;
    if (!fullAccess) {
      toast.error('Join via your organization to participate in circles');
      return;
    }

    try {
      await supabase
        .from('circle_memberships')
        .insert({
          circle_id: circleId,
          user_id: user.id,
          role: 'member'
        });

      fetchCommunityData();
      setHasInteracted(true);
      toast.success('Joined circle!');
    } catch (error) {
      console.error('Error joining circle:', error);
      toast.error('Failed to join circle');
    }
  };

  const createPost = async () => {
    if (!user || !newPostContent.trim()) return;
    if (!fullAccess) {
      toast.error('Join via your organization to post');
      return;
    }

    try {
      await supabase
        .from('posts')
        .insert({
          content: newPostContent,
          post_type: newPostType,
          user_id: user.id,
          visibility: 'public'
        });

      setNewPostContent('');
      fetchCommunityData();
      setHasInteracted(true);
      toast.success('Post shared!');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to share post');
    }
  };

  const reactToPost = async (postId: string, reactionType: string) => {
    if (!user) return;

    try {
      await supabase
        .from('post_reactions')
        .upsert({
          post_id: postId,
          user_id: user.id,
          reaction_type: reactionType
        });

      fetchCommunityData();
      setHasInteracted(true);
    } catch (error) {
      console.error('Error reacting to post:', error);
    }
  };

if (profileLoading || loading) {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">Loading community...</div>
    </div>
  );
}

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          SoulSpark Community
        </h1>
        <p className="text-muted-foreground">Connect, grow, and inspire one another on your journey.</p>
      </div>

      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="circles">Spark Circles</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="share">Share</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Community Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{post.authorDisplayName}</p>
                      <Badge variant="secondary" className="text-xs">
                        {post.post_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm mb-3">{post.content}</p>
                  <div className="flex gap-2">
                    {['heart', 'pray', 'amen', 'celebrate'].map((reaction) => (
                      <Button
                        key={reaction}
                        size="sm"
                        variant="ghost"
                        onClick={() => reactToPost(post.id, reaction)}
                        className="text-xs"
                      >
                        {reaction === 'heart' && '❤️'}
                        {reaction === 'pray' && '🙏'}
                        {reaction === 'amen' && '✨'}
                        {reaction === 'celebrate' && '🎉'}
                        {post.reactions?.filter(r => r.reaction_type === reaction).length || 0}
                      </Button>
                    ))}
                  </div>
                </Card>
              ))}
              
              {/* Community Feedback */}
              {hasInteracted && posts.length > 0 && (
                <Card className="p-4 bg-muted/30">
                  <QuickFeedback
                    featureType="community"
                    onDetailedFeedback={() => setFeedbackModalOpen(true)}
                  />
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="circles" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Spark Circles</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Circle
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Spark Circle</DialogTitle>
                  <DialogDescription>
                    Start a small group for deeper connections and accountability
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="circle-name">Circle Name</Label>
                    <Input
                      id="circle-name"
                      value={newCircleName}
                      onChange={(e) => setNewCircleName(e.target.value)}
                      placeholder="e.g., Morning Prayer Warriors"
                    />
                  </div>
                  <div>
                    <Label htmlFor="circle-desc">Description</Label>
                    <Textarea
                      id="circle-desc"
                      value={newCircleDesc}
                      onChange={(e) => setNewCircleDesc(e.target.value)}
                      placeholder="What is this circle about?"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={createCircle} disabled={!newCircleName.trim()}>
                    Create Circle
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {circles.map((circle) => (
              <Card key={circle.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" />
                    {circle.name}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {circle.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      {circle.memberships?.length || 0}/{circle.max_members} members
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => joinCircle(circle.id)}
                      disabled={circle.memberships?.some(m => m.user_id === user?.id)}
                    >
                      {circle.memberships?.some(m => m.user_id === user?.id) ? 'Joined' : 'Join'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <h3 className="text-lg font-semibold">Active Challenges</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {challenges.map((challenge) => (
              <Card key={challenge.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4" />
                    {challenge.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {challenge.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>{challenge.type.replace('_', ' ')}</span>
                      <span>{challenge.duration_days} days</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>{challenge.participations?.length || 0} participants</span>
                      <Badge variant="secondary">
                        <Award className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="share" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Share Your Journey</CardTitle>
              <CardDescription>
                Inspire others by sharing your wins, requests, and reflections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="post-type">Post Type</Label>
                <Select value={newPostType} onValueChange={(value: any) => setNewPostType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="win">🎉 Victory/Win</SelectItem>
                    <SelectItem value="prayer_request">🙏 Prayer Request</SelectItem>
                    <SelectItem value="testimony">✨ Testimony</SelectItem>
                    <SelectItem value="reflection">💭 Reflection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="post-content">Content</Label>
                <Textarea
                  id="post-content"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Share what's on your heart..."
                  rows={4}
                />
              </div>
              <Button onClick={createPost} disabled={!newPostContent.trim()}>
                Share Post
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Community Feedback */}
      {hasInteracted && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <QuickFeedback
            featureType="community"
            onDetailedFeedback={() => setFeedbackModalOpen(true)}
          />
        </div>
      )}
      
      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        featureType="community"
      />
    </div>
  );
};

export default Community;