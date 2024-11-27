import { Text } from 'ink';
import React from 'react';

interface Props {
  items: string[];
}

export default function Breadcrumbs({ items }: Props) {
  if (!items || items.length < 1) {
    return <></>;
  }

  return (
    <Text>
      {items.slice(0, items.length - 1).map((item: string) => (
        <Text key={item} color='gray'>
          {item + ' » '}
        </Text>
      ))}
      <Text color='white'>{items[items.length - 1]}</Text>
    </Text>
  );
}
