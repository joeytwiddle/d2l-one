import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Title } from 'react-native-paper';
import { PartialRescue } from '../client-types';

export default function RescueCard({
  rescue,
  additional: Additional,
}: {
  rescue: PartialRescue;
  additional?: React.ComponentType<any>;
}) {
  return (
    <Card style={styles.card}>
      <Title>
        {rescue.site.fullName} at {rescue.date}
      </Title>
      {Additional && (
        <Card.Actions>
          <Additional />
        </Card.Actions>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 10,
    padding: 10,
    // Leaves room for scrollbar(s) on web
    width: '90%',
    maxWidth: 600,
  },
});
