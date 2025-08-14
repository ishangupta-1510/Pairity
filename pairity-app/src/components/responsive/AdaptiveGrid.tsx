import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ViewStyle,
  ListRenderItem,
} from 'react-native';
import { useGridConfig, useDeviceInfo, useAdaptivePadding } from '@/hooks/useResponsive';
import { moderateScale } from '@/utils/responsive';

interface AdaptiveGridProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
  columnSpacing?: number;
  rowSpacing?: number;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  onRefresh?: () => void;
  refreshing?: boolean;
  maxColumns?: number;
}

function AdaptiveGrid<T>({
  data,
  renderItem,
  keyExtractor,
  columnSpacing,
  rowSpacing,
  style,
  contentContainerStyle,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  onRefresh,
  refreshing,
  maxColumns = 5,
}: AdaptiveGridProps<T>) {
  const deviceInfo = useDeviceInfo();
  const gridConfig = useGridConfig();
  const padding = useAdaptivePadding();
  
  const numColumns = Math.min(gridConfig.columns, maxColumns);
  const spacing = {
    column: columnSpacing ?? gridConfig.gap,
    row: rowSpacing ?? gridConfig.gap,
  };

  const renderGridItem: ListRenderItem<T> = ({ item, index }) => {
    const isLastInRow = (index + 1) % numColumns === 0;
    const isLastRow = index >= data.length - numColumns;
    
    return (
      <View
        style={[
          styles.gridItem,
          {
            flex: 1 / numColumns,
            marginRight: isLastInRow ? 0 : spacing.column,
            marginBottom: isLastRow ? 0 : spacing.row,
          },
        ]}
      >
        {renderItem({ item, index, separators: {
          highlight: () => {},
          unhighlight: () => {},
          updateProps: () => {},
        }})}
      </View>
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={renderGridItem}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      key={`${numColumns}-${deviceInfo.orientation}`} // Force re-render on orientation change
      style={[styles.container, style]}
      contentContainerStyle={[
        {
          padding,
        },
        contentContainerStyle,
      ]}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={ListEmptyComponent}
      onRefresh={onRefresh}
      refreshing={refreshing}
      columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    justifyContent: 'space-between',
  },
  gridItem: {
    minHeight: moderateScale(100),
  },
});

export default AdaptiveGrid;