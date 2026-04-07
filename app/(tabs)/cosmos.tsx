import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StarField } from '../../src/components/ui/StarField';
import { GradientCard } from '../../src/components/ui/GradientCard';
import { CosmicOrb } from '../../src/components/ui/CosmicOrb';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const ZODIAC_EMOJI: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const SIGN_COLORS: Record<string, string> = {
  Aries: '#FF3A5C', Taurus: '#00E09A', Gemini: '#FFD700', Cancer: '#C0C0CC',
  Leo: '#FF6B35', Virgo: '#7C6DFF', Libra: '#A89EFF', Scorpio: '#FF3A5C',
  Sagittarius: '#FF6B35', Capricorn: '#888899', Aquarius: '#00E5D1', Pisces: '#7C6DFF',
};

const COMMUNITY_POSTS = [
  {
    id: '1',
    author: 'Luna Starweaver',
    sign: 'Scorpio',
    timeAgo: '12m ago',
    text: 'Just pulled the Tower card during today\'s full moon reading and honestly? It feels right. Sometimes things need to crumble so something real can grow. Anyone else feeling this intense Scorpio energy tonight? 🌕',
    likes: 84,
    comments: 23,
    type: 'cosmic-insight',
  },
  {
    id: '2',
    author: 'Aiden Cosmico',
    sign: 'Leo',
    timeAgo: '47m ago',
    text: 'My partner is a Pisces rising and I\'m Leo sun — we shouldn\'t work on paper but our synastry chart is FIRE. Venus conjunct Mars in the 7th house. CosmicSelf compatibility reading nailed it. 🔥',
    likes: 142,
    comments: 38,
    type: 'compatibility',
  },
  {
    id: '3',
    author: 'Sage Moonchild',
    sign: 'Cancer',
    timeAgo: '1h ago',
    text: 'Daily reflection: Mercury moved into my 10th house today and I finally had the courage to pitch my project to leadership. Astrology doesn\'t make things happen — it helps you understand the timing. Trust the transits.',
    likes: 217,
    comments: 45,
    type: 'daily-reflection',
  },
  {
    id: '4',
    author: 'Nova Eclipse',
    sign: 'Aquarius',
    timeAgo: '2h ago',
    text: 'Saturn return survivors — how long until the fog lifts? Month 8 here and I\'ve already changed careers, ended a 4-year relationship, and moved cities. They said it would be transformative but nobody warned me it would be THIS much. 😅',
    likes: 329,
    comments: 91,
    type: 'cosmic-insight',
  },
  {
    id: '5',
    author: 'Celeste Vega',
    sign: 'Pisces',
    timeAgo: '3h ago',
    text: 'New moon journaling prompt that changed my life: "What would I create if I knew the universe was conspiring in my favor?" Write it down tonight. Thank me later. ✨',
    likes: 196,
    comments: 52,
    type: 'daily-reflection',
  },
];

const TRENDING_TOPICS = [
  { label: 'Mercury Retrograde', icon: 'planet-outline' as const, count: '2.4k posts' },
  { label: 'Full Moon in Scorpio', icon: 'moon-outline' as const, count: '1.8k posts' },
  { label: 'Saturn Return Stories', icon: 'time-outline' as const, count: '956 posts' },
  { label: 'Venus in Gemini', icon: 'heart-outline' as const, count: '743 posts' },
  { label: 'Eclipse Season', icon: 'eye-outline' as const, count: '621 posts' },
];

const WESTERN_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const TYPE_BADGES: Record<string, { label: string; color: string }> = {
  'cosmic-insight': { label: 'COSMIC INSIGHT', color: COLORS.kp },
  'compatibility': { label: 'COMPATIBILITY', color: COLORS.chinese },
  'daily-reflection': { label: 'REFLECTION', color: COLORS.western },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function CosmosScreen() {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const toggleLike = (id: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <StarField>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <CosmicOrb size={120} primaryColor={COLORS.kp} secondaryColor={COLORS.western} />
          <Text style={styles.title}>COSMOS</Text>
          <Text style={styles.subtitle}>Connect with fellow cosmic explorers</Text>
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.28)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.divider}
          />
        </View>

        {/* Weekly Event */}
        <View style={styles.eventShadow}>
          <View style={styles.eventCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.03)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFillObject, { borderRadius: BORDER_RADIUS.xl }]}
            />
            <LinearGradient
              colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[StyleSheet.absoluteFillObject, { borderRadius: BORDER_RADIUS.xl }]}
              pointerEvents="none"
            />
            <View style={styles.eventInner}>
              <View style={styles.eventBadge}>
                <Ionicons name="calendar-outline" size={12} color={COLORS.gold} />
                <Text style={styles.eventLabel}>THIS WEEK</Text>
              </View>
              <Text style={styles.eventTitle}>New Moon Intention Setting</Text>
              <Text style={styles.eventDesc}>
                Set your intentions under the new moon's energy. Write down your dreams and let the cosmos amplify them.
              </Text>
            </View>
          </View>
        </View>

        {/* Trending Topics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up-outline" size={16} color={COLORS.kp} />
            <Text style={styles.sectionLabel}>TRENDING</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trendingScroll}>
            {TRENDING_TOPICS.map((topic, i) => (
              <AnimatedPressable key={i} onPress={() => {}} style={styles.trendingChip}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.03)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[StyleSheet.absoluteFillObject, { borderRadius: BORDER_RADIUS.lg }]}
                />
                <Ionicons name={topic.icon} size={16} color={COLORS.kp} />
                <View style={styles.trendingTextWrap}>
                  <Text style={styles.trendingLabel}>{topic.label}</Text>
                  <Text style={styles.trendingCount}>{topic.count}</Text>
                </View>
              </AnimatedPressable>
            ))}
          </ScrollView>
        </View>

        {/* Community Feed */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="chatbubbles-outline" size={16} color={COLORS.western} />
            <Text style={styles.sectionLabel}>COMMUNITY FEED</Text>
          </View>

          {COMMUNITY_POSTS.map(post => {
            const liked = likedPosts.has(post.id);
            const badge = TYPE_BADGES[post.type];
            const signColor = SIGN_COLORS[post.sign] || COLORS.textSecondary;

            return (
              <GradientCard key={post.id} style={styles.postCard}>
                {/* Post header */}
                <View style={styles.postHeader}>
                  <View style={[styles.avatarCircle, { borderColor: signColor }]}>
                    <Text style={styles.avatarEmoji}>{ZODIAC_EMOJI[post.sign]}</Text>
                  </View>
                  <View style={styles.postMeta}>
                    <Text style={styles.authorName}>{post.author}</Text>
                    <View style={styles.postMetaRow}>
                      <View style={[styles.signBadge, { backgroundColor: `${signColor}20` }]}>
                        <Text style={[styles.signBadgeText, { color: signColor }]}>{post.sign}</Text>
                      </View>
                      <Text style={styles.timestamp}>{post.timeAgo}</Text>
                    </View>
                  </View>
                </View>

                {/* Type badge */}
                {badge && (
                  <View style={[styles.typeBadge, { backgroundColor: `${badge.color}18` }]}>
                    <Text style={[styles.typeBadgeText, { color: badge.color }]}>{badge.label}</Text>
                  </View>
                )}

                {/* Post body */}
                <Text style={styles.postText}>{post.text}</Text>

                {/* Actions */}
                <View style={styles.postActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => toggleLike(post.id)} activeOpacity={0.7}>
                    <Ionicons
                      name={liked ? 'heart' : 'heart-outline'}
                      size={18}
                      color={liked ? COLORS.chinese : COLORS.textMuted}
                    />
                    <Text style={[styles.actionText, liked && { color: COLORS.chinese }]}>
                      {post.likes + (liked ? 1 : 0)}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                    <Ionicons name="chatbubble-outline" size={16} color={COLORS.textMuted} />
                    <Text style={styles.actionText}>{post.comments}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                    <Ionicons name="share-outline" size={17} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
              </GradientCard>
            );
          })}
        </View>

        {/* Sign-Based Community Groups */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people-outline" size={16} color={COLORS.gold} />
            <Text style={styles.sectionLabel}>COMMUNITY GROUPS</Text>
          </View>
          <View style={styles.signGrid}>
            {WESTERN_SIGNS.map(sign => {
              const color = SIGN_COLORS[sign];
              return (
                <AnimatedPressable key={sign} onPress={() => {}} style={styles.signCard}>
                  <LinearGradient
                    colors={[`${color}22`, `${color}08`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[StyleSheet.absoluteFillObject, { borderRadius: BORDER_RADIUS.md }]}
                  />
                  <Text style={styles.signEmoji}>{ZODIAC_EMOJI[sign]}</Text>
                  <Text style={[styles.signName, { color }]}>{sign}</Text>
                </AnimatedPressable>
              );
            })}
          </View>
        </View>

        {/* Did You Know */}
        <GradientCard accentColor="rgba(255,255,255,0.25)">
          <View style={styles.factHeader}>
            <Ionicons name="bulb-outline" size={16} color={COLORS.gold} />
            <Text style={styles.factLabel}>DID YOU KNOW?</Text>
          </View>
          <Text style={styles.factText}>
            CosmicSelf is the only app that combines Western, Vedic, Chinese, and KP
            astrology in one place. Your Cosmic DNA is unique across all 4 traditions.
          </Text>
        </GradientCard>

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* FAB — New Post */}
      <AnimatedPressable onPress={() => {}} style={styles.fab}>
        <LinearGradient
          colors={[COLORS.western, COLORS.kp]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color={COLORS.white} />
        </LinearGradient>
      </AnimatedPressable>
    </StarField>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { paddingHorizontal: SPACING.lg, paddingTop: 58, gap: SPACING.lg },

  // Header
  header: { alignItems: 'center', gap: SPACING.xs },
  title: {
    fontFamily: 'Cinzel_900Black',
    color: COLORS.white,
    fontSize: 28,
    letterSpacing: 8,
    textShadowColor: 'rgba(255,255,255,0.18)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center' },
  divider: { width: 80, height: 1, marginTop: SPACING.sm, opacity: 0.5 },

  // Weekly Event
  eventShadow: {
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 12,
  },
  eventCard: {
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    overflow: 'hidden',
  },
  eventInner: { padding: SPACING.lg, gap: SPACING.xs },
  eventBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  eventLabel: {
    fontFamily: 'Cinzel_400Regular',
    fontSize: 11,
    color: COLORS.gold,
    letterSpacing: 2,
  },
  eventTitle: { color: COLORS.white, fontSize: 19, fontFamily: 'Cinzel_700Bold', letterSpacing: 0.3 },
  eventDesc: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 4 },

  // Section
  section: { gap: SPACING.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionLabel: {
    fontFamily: 'Cinzel_400Regular',
    fontSize: 11,
    color: COLORS.textSecondary,
    letterSpacing: 2,
  },

  // Trending
  trendingScroll: { marginHorizontal: -SPACING.lg, paddingHorizontal: SPACING.lg },
  trendingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    marginRight: SPACING.sm,
    overflow: 'hidden',
  },
  trendingTextWrap: { gap: 1 },
  trendingLabel: { color: COLORS.white, fontSize: 12, fontFamily: 'Cinzel_700Bold', letterSpacing: 0.3 },
  trendingCount: { color: COLORS.textMuted, fontSize: 11 },

  // Post card
  postCard: { marginBottom: 0 },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 20 },
  postMeta: { flex: 1, gap: 2 },
  postMetaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  authorName: { color: COLORS.white, fontSize: 14, fontFamily: 'Cinzel_700Bold', letterSpacing: 0.3 },
  signBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  signBadgeText: { fontSize: 10, fontFamily: 'Cinzel_400Regular', letterSpacing: 1 },
  timestamp: { color: COLORS.textMuted, fontSize: 11 },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  typeBadgeText: { fontSize: 10, fontFamily: 'Cinzel_400Regular', letterSpacing: 1.5 },
  postText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: SPACING.sm },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText: { color: COLORS.textMuted, fontSize: 12 },

  // Sign grid
  signGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  signCard: {
    width: '30.5%',
    aspectRatio: 1,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    overflow: 'hidden',
  },
  signEmoji: { fontSize: 26 },
  signName: { fontSize: 11, fontFamily: 'Cinzel_700Bold', letterSpacing: 0.5 },

  // Did You Know
  factHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.xs },
  factLabel: { color: COLORS.gold, fontSize: 11, fontFamily: 'Cinzel_400Regular', letterSpacing: 2 },
  factText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20 },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 130,
    right: SPACING.lg,
    shadowColor: COLORS.western,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
