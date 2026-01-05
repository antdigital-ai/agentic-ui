```tsx
/**
 * inline: true
 */
import HomePage from '../home/demo-components/HomePage/index';

export default () => {
  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        paddingTop: 142,
        overflowX: 'hidden',
        backgroundColor: '#fff',
      }}
    >
      <HomePage />
    </div>
  );
};
```
