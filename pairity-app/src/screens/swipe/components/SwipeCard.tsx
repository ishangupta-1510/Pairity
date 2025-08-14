import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
  ImageBackground,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-community/blur';
import { SwipeProfile } from '@/types/matching';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface SwipeCardProps {
  profile: SwipeProfile;
  likeOpacity: Animated.AnimatedInterpolation<number>;
  nopeOpacity: Animated.AnimatedInterpolation<number>;
  superLikeOpacity: Animated.AnimatedInterpolation<number>;
  maybeOpacity: Animated.AnimatedInterpolation<number>;
  isPremium: boolean;
  isPreview?: boolean;
  isBlurred?: boolean;
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  profile,
  likeOpacity,
  nopeOpacity,
  superLikeOpacity,
  maybeOpacity,
  isPremium,
  isPreview = false,
  isBlurred = false,
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  const handlePhotoPress = (e: any) => {
    if (isPreview) return;
    
    const touchX = e.nativeEvent.locationX;
    const cardWidth = screenWidth - 32;
    
    if (touchX < cardWidth / 3) {
      // Previous photo
      if (currentPhotoIndex > 0) {
        setCurrentPhotoIndex(currentPhotoIndex - 1);
      }
    } else if (touchX > (cardWidth * 2) / 3) {
      // Next photo
      if (currentPhotoIndex < profile.photos.length - 1) {
        setCurrentPhotoIndex(currentPhotoIndex + 1);
      }
    } else {
      // Center - toggle info
      setShowInfo(!showInfo);
    }
  };

  const renderContent = () => (
    <>
      {/* Photo Indicators */}
      <View style={styles.photoIndicators}>
        {profile.photos.map((_, index) => (
          <View
            key={index}
            style={[
              styles.photoIndicator,
              index === currentPhotoIndex && styles.photoIndicatorActive,
            ]}
          />
        ))}
      </View>

      {/* Action Overlays */}
      {!isPreview && (
        <>
          <Animated.View style={[styles.actionOverlay, styles.likeOverlay, { opacity: likeOpacity }]}>
            <Text style={styles.likeText}>LIKE</Text>
          </Animated.View>
          <Animated.View style={[styles.actionOverlay, styles.nopeOverlay, { opacity: nopeOpacity }]}>
            <Text style={styles.nopeText}>NOPE</Text>
          </Animated.View>
          <Animated.View style={[styles.actionOverlay, styles.superLikeOverlay, { opacity: superLikeOpacity }]}>
            <Text style={styles.superLikeText}>SUPER LIKE</Text>
          </Animated.View>
          {isPremium && (
            <Animated.View style={[styles.actionOverlay, styles.maybeOverlay, { opacity: maybeOpacity }]}>
              <Text style={styles.maybeText}>MAYBE</Text>
            </Animated.View>
          )}
        </>
      )}

      {/* Info Overlay */}
      <View style={styles.infoOverlay}>
        {!showInfo ? (
          // Basic Info
          <View style={styles.basicInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{profile.name}, {profile.age}</Text>
              {profile.isVerified && (
                <Icon name="verified" size={20} color="#339AF0" style={styles.verifiedIcon} />
              )}
            </View>
            <View style={styles.locationContainer}>
              <Icon name="location-on" size={14} color="#fff" />
              <Text style={styles.location}>{profile.location}</Text>
            </View>
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => !isPreview && setShowInfo(true)}
            >
              <Icon name="info" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          // Detailed Info
          <ScrollView
            style={styles.detailedInfo}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.detailedInfoContent}
          >
            <View style={styles.detailHeader}>
              <Text style={styles.name}>{profile.name}, {profile.age}</Text>
              <TouchableOpacity onPress={() => setShowInfo(false)}>
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {profile.work && (
              <View style={styles.detailItem}>
                <Icon name="work" size={16} color="#fff" />
                <Text style={styles.detailText}>{profile.work}</Text>
              </View>
            )}

            {profile.education && (
              <View style={styles.detailItem}>
                <Icon name="school" size={16} color="#fff" />
                <Text style={styles.detailText}>{profile.education}</Text>
              </View>
            )}

            {profile.height && (
              <View style={styles.detailItem}>
                <Icon name="straighten" size={16} color="#fff" />
                <Text style={styles.detailText}>{profile.height}</Text>
              </View>
            )}

            <Text style={styles.bioTitle}>About</Text>
            <Text style={styles.bio}>{profile.bio}</Text>

            {profile.interests.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Interests</Text>
                <View style={styles.interestsContainer}>
                  {profile.interests.map((interest, index) => (
                    <View key={index} style={styles.interestTag}>
                      <Text style={styles.interestText}>{interest}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {profile.prompts.map((prompt, index) => (
              <View key={index} style={styles.promptContainer}>
                <Text style={styles.promptQuestion}>{prompt.question}</Text>
                <Text style={styles.promptAnswer}>{prompt.answer}</Text>
              </View>
            ))}

            {/* Social Integration */}
            <View style={styles.socialContainer}>
              {profile.hasInstagram && (
                <View style={styles.socialBadge}>
                  <Icon name="photo-camera" size={16} color="#E4405F" />
                  <Text style={styles.socialText}>Instagram Connected</Text>
                </View>
              )}
              {profile.hasSpotify && (
                <View style={styles.socialBadge}>
                  <Icon name="music-note" size={16} color="#1DB954" />
                  <Text style={styles.socialText}>Spotify Connected</Text>
                </View>
              )}
            </View>

            {profile.spotifyArtists.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Top Artists</Text>
                <View style={styles.artistsContainer}>
                  {profile.spotifyArtists.map((artist, index) => (
                    <Text key={index} style={styles.artistText}>{artist}</Text>
                  ))}
                </View>
              </>
            )}

            <View style={styles.matchPercentageContainer}>
              <Icon name="favorite" size={16} color="#FF6B6B" />
              <Text style={styles.matchPercentageText}>
                {profile.matchPercentage}% Match
              </Text>
            </View>
          </ScrollView>
        )}
      </View>
    </>
  );

  if (isBlurred) {
    return (
      <ImageBackground
        source={{ uri: profile.photos[currentPhotoIndex] }}
        style={styles.card}
        imageStyle={styles.cardImage}
      >
        <BlurView
          style={StyleSheet.absoluteFillObject}
          blurType="light"
          blurAmount={10}
        />
        {renderContent()}
      </ImageBackground>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={1}
      onPress={handlePhotoPress}
      disabled={isPreview}
    >
      <Image
        source={{ uri: profile.photos[currentPhotoIndex] }}
        style={styles.cardImage}
      />
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoIndicators: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  photoIndicator: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  photoIndicatorActive: {
    backgroundColor: '#fff',
  },
  actionOverlay: {
    position: 'absolute',
    padding: 10,
    borderRadius: 10,
    borderWidth: 4,
  },
  likeOverlay: {
    top: 60,
    left: 40,
    transform: [{ rotate: '-30deg' }],
    borderColor: '#51CF66',
  },
  likeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#51CF66',
  },
  nopeOverlay: {
    top: 60,
    right: 40,
    transform: [{ rotate: '30deg' }],
    borderColor: '#FF6B6B',
  },
  nopeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  superLikeOverlay: {
    bottom: 120,
    alignSelf: 'center',
    borderColor: '#339AF0',
  },
  superLikeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#339AF0',
  },
  maybeOverlay: {
    top: 120,
    alignSelf: 'center',
    borderColor: '#FFD43B',
  },
  maybeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD43B',
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '70%',
  },
  basicInfo: {
    padding: 20,
    paddingBottom: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  verifiedIcon: {
    marginLeft: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  location: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 4,
  },
  infoButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailedInfo: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  detailedInfoContent: {
    padding: 20,
    paddingBottom: 40,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 8,
  },
  bioTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  bio: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 22,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 12,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  interestTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  interestText: {
    fontSize: 12,
    color: '#fff',
  },
  promptContainer: {
    marginVertical: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  promptQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  promptAnswer: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  socialContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  socialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  socialText: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 6,
  },
  artistsContainer: {
    marginBottom: 16,
  },
  artistText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 4,
  },
  matchPercentageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 12,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: 20,
  },
  matchPercentageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
});

export default SwipeCard;