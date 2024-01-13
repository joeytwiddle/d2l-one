import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title } from 'react-native-paper';
import { getSite } from '../data/site-data';
import { Rescue, RescueLite, Site } from '../graphql';
import { LoadingSpinner, Text, View } from './Themed';

export default function RescueCard({
  rescue,
  additional: Additional,
  onPress,
  onLongPress,
  ...rest
}: {
  rescue: Rescue | RescueLite;
  onPress?: () => void;
  onLongPress?: () => void;
  additional?: React.ComponentType<any>;
}) {
  // Use a TouchableOpacity wrapper, only if the component is clickable
  // (The advantage of using such a wrapper is to change the cursor on hover on web, and for semantics, although a Card can be provided an onPress directly)
  const Wrapper = onPress || onLongPress ? TouchableOpacity : View;
  const siteId = (rescue as RescueLite).siteId || (rescue as Rescue).site.id;
  const site = getSite(siteId);
  return (
    <Wrapper style={styles.wrapper} onPress={onPress} onLongPress={onLongPress}>
      <Card style={styles.card} {...rest}>
        {!site && <LoadingSpinner />}
        {site && (
          <>
            <Title style={styles.title}>{site.fullName}</Title>
            <Text>
              {niceDate(rescue.date)}, {niceTime(site.collectionTime)}
            </Text>
            {Additional && (
              <Card.Actions>
                <Additional />
              </Card.Actions>
            )}
          </>
        )}
      </Card>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    margin: 10,
    // Leaves room for scrollbar(s) on web
    width: '90%',
    maxWidth: 600,
  },
  card: {
    backgroundColor: '#e8e8e8',
    padding: 10,
  },
  title: {
    fontWeight: 'bold',
  },
});

export function niceDate(dateStr: string) {
  const date = new Date(dateStr);
  const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
  const shortMonthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][
    date.getMonth()
  ];
  return `${dayOfWeek}, ${shortMonthName} ${date.getDate()}`;
}

export function niceTime(timeStr: string) {
  if (timeStr === 'ANY') {
    return 'any time';
  }
  if (timeStr.match(/^[0-9][0-9]*:[0-9][0-9]$/)) {
    const [hourStr, minStr] = timeStr.split(':');
    const [hour, min] = [hourStr, minStr].map(str => Number(str));
    if (hour < 12) {
      return `${hour}:${minStr} am`;
    } else if (hour === 12) {
      return `${hour}:${minStr} pm`;
    } else if (hour > 12) {
      return `${hour - 12}:${minStr} pm`;
    }
    return 'IMPOSSIBLE';
  }
  // This might be a range, such as '16:00 to 16:45'
  // In this case, we will simply return the string we were given
  return `${timeStr}`;
}
