import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/components/ThemeProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Testimonial {
  id: number;
  name: string;
  age: number;
  text: string;
  rating: number;
  image: string;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
}

const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({ testimonials }) => {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % testimonials.length;
      setCurrentIndex(nextIndex);
      
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
      }
    }, 4000); // Auto scroll every 4 seconds

    return () => clearInterval(interval);
  }, [currentIndex, testimonials.length]);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon
          key={i}
          name={i <= rating ? 'star' : 'star-border'}
          size={16}
          color="#FFD700"
        />
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const renderTestimonial = ({ item }: { item: Testimonial }) => (
    <View style={[styles.testimonialCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.testimonialContent}>
        <Text style={[styles.testimonialText, { color: theme.colors.text }]}>
          "{item.text}"
        </Text>
        
        {renderStars(item.rating)}
        
        <View style={styles.authorInfo}>
          <Image source={{ uri: item.image }} style={styles.authorImage} />
          <Text style={[styles.authorName, { color: theme.colors.text }]}>
            {item.name}, {item.age}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {testimonials.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            {
              backgroundColor: index === currentIndex 
                ? theme.colors.premium 
                : theme.colors.textSecondary,
              opacity: index === currentIndex ? 1 : 0.3,
            },
          ]}
        />
      ))}
    </View>
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      if (index !== null && index !== currentIndex) {
        setCurrentIndex(index);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={testimonials}
        renderItem={renderTestimonial}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        snapToInterval={SCREEN_WIDTH - 32}
        decelerationRate="fast"
        contentContainerStyle={styles.carouselContent}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH - 32,
          offset: (SCREEN_WIDTH - 32) * index,
          index,
        })}
      />
      
      {renderPagination()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  carouselContent: {
    paddingHorizontal: 16,
  },
  testimonialCard: {
    width: SCREEN_WIDTH - 32,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  testimonialContent: {
    alignItems: 'center',
  },
  testimonialText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 2,
  },
  authorInfo: {
    alignItems: 'center',
    gap: 8,
  },
  authorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  pagination: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default TestimonialCarousel;