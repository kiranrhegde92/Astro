import React, { useCallback, useRef } from 'react';
import { ScrollView, type ScrollViewProps } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export function ResetScrollView(props: ScrollViewProps) {
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        scrollRef.current?.scrollTo({ x: 0, y: 0, animated: false });
      }, 0);

      return () => clearTimeout(timer);
    }, [])
  );

  return <ScrollView ref={scrollRef} {...props} />;
}
