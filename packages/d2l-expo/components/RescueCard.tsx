import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Title } from 'react-native-paper';
import { PartialRescue } from '../client-types';
import { Rescue, Site } from '../graphql';
import { Text, View } from './Themed';

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
      {Additional && <Additional />}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 10,
    padding: 10,
    width: '100%',
    maxWidth: 600,
  },
});
