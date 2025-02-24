import { Text } from 'ink';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../store/store.js';

interface Props {
  state: 'SUCCESS' | 'ERROR' | 'NOT_STARTED' | 'IN_PROGRESS';
}

const PROGRESS_FRAMES = ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'];

export default function ProgressIndicator(props: Props) {
  const tick = useSelector<RootState>((state) => state.clock.tick) as number;
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    setFrame(tick % PROGRESS_FRAMES.length);
  }, [tick]);

  switch (props.state) {
    case 'NOT_STARTED': {
      return <Text> </Text>;
    }
    case 'IN_PROGRESS': {
      return <Text>{PROGRESS_FRAMES[frame]}</Text>;
    }
    case 'SUCCESS': {
      return <Text color={'green'}>{'✓'}</Text>;
    }
    case 'ERROR': {
      return <Text color={'red'}>{'✗'}</Text>;
    }
    default: {
      return <></>;
    }
  }
}
