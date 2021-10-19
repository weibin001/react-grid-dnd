import React from 'react';
import { ComponentStory, ComponentMeta, storiesOf } from '@storybook/react';
import { GridContext, GridDropZone, GridContextProvider } from '../src';
import { swap, move } from '../src/utils';

import { GridItem } from '../src/GridItem';
import { Example } from './Example';

interface AppState {
  [key: string]: Array<{
    name: string;
    id: number;
  }>;
}

function DragBetweenExample({ single }: any) {
  const [mounted, setMounted] = React.useState(false);
  const [items, setItems] = React.useState<AppState>({
    left: [
      { id: 1, name: 'ben' },
      { id: 2, name: 'joe' },
      { id: 3, name: 'jason' },
      { id: 4, name: 'chris' },
      { id: 5, name: 'heather' },
      { id: 6, name: 'Richard' },
    ],
    right: [
      { id: 7, name: 'george' },
      { id: 8, name: 'rupert' },
      { id: 9, name: 'alice' },
      { id: 10, name: 'katherine' },
      { id: 11, name: 'pam' },
      { id: 12, name: 'katie' },
    ],
    dock: [{ id: 13, name: 'Whatever' }],
  });

  React.useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 500);
  }, []);

  function onChange(sourceId: any, sourceIndex: number, targetIndex: number, targetId?: string) {
    if (targetId) {
      const result = move(items[sourceId], items[targetId], sourceIndex, targetIndex);
      return setItems({
        ...items,
        [sourceId]: result[0],
        [targetId]: result[1],
      });
    }

    const result = swap(items[sourceId], sourceIndex, targetIndex);
    return setItems({
      ...items,
      [sourceId]: result,
    });
  }

  return (
    <GridContextProvider onChange={onChange}>
      <div
        style={{
          display: 'flex',
          touchAction: 'none',
        }}
      >
        <div style={{ display: 'flex' }}>
          <GridDropZone
            style={{
              flex: '0 0 auto',
              height: '400px',
              width: '400px',
              border: '1px solid #bbb',
              borderRadius: '1rem',
              marginRight: '10px',
              touchAction: 'none',
            }}
            id="left"
            boxesPerRow={4}
            rowHeight={70}
          >
            {items.left.map((item) => (
              <GridItem key={item.name}>
                <div
                  style={{
                    padding: '10px',
                    width: '100%',
                    height: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      boxSizing: 'border-box',
                      background: '#08e',
                      display: 'flex',
                      justifyContent: 'center',
                      color: 'white',
                      fontFamily: 'helvetica',
                      alignItems: 'center',
                      borderRadius: '50%',
                    }}
                  >
                    {item.name[0].toUpperCase()}
                  </div>
                </div>
              </GridItem>
            ))}
          </GridDropZone>
          {!single && (
            <GridDropZone
              style={{
                flex: '0 0 auto',
                height: '400px',

                width: '400px',
                border: '1px solid #bbb',
                borderRadius: '1rem',
                marginLeft: '10px',
                touchAction: 'none',
              }}
              id="right"
              boxesPerRow={4}
              rowHeight={70}
            >
              {items.right.map((item) => (
                <GridItem key={item.name}>
                  {(Component: any, props: any) => (
                    <Component {...props}>
                      <div
                        style={{
                          padding: '10px',
                          width: '100%',
                          height: '100%',
                          boxSizing: 'border-box',
                        }}
                      >
                        <div
                          style={{
                            width: '50px',
                            height: '50px',
                            boxSizing: 'border-box',
                            background: '#08e',
                            display: 'flex',
                            justifyContent: 'center',
                            color: 'white',
                            fontFamily: 'helvetica',
                            alignItems: 'center',
                            borderRadius: '50%',
                          }}
                        >
                          {item.name[0].toUpperCase()}
                        </div>
                      </div>
                    </Component>
                  )}
                </GridItem>
              ))}
            </GridDropZone>
          )}
        </div>
      </div>
      <GridDropZone
        style={{
          flex: '0 0 auto',
          height: '200px',
          width: '400px',
          border: '1px solid red',
          borderRadius: '1rem',
          marginRight: '10px',
          touchAction: 'none',
        }}
        id="dock"
        boxesPerRow={4}
        rowHeight={70}
      >
        {items.dock.map((item) => (
          <GridItem key={item.name}>
            <div
              style={{
                padding: '10px',
                width: '100%',
                height: '100%',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  boxSizing: 'border-box',
                  background: '#08e',
                  display: 'flex',
                  justifyContent: 'center',
                  color: 'white',
                  fontFamily: 'helvetica',
                  alignItems: 'center',
                  borderRadius: '50%',
                }}
              >
                {item.name[0].toUpperCase()}
              </div>
            </div>
          </GridItem>
        ))}
      </GridDropZone>
    </GridContextProvider>
  );
}

function TransformExample() {
  const [transform, setTransform] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      setTransform(true);
    }, 2000);
  }, []);

  return (
    <div
      style={{
        transform: transform ? 'translateX(-30%)' : 'translateX(0)',
        transition: 'transform 0.25s ease',
      }}
    >
      <DragBetweenExample />
    </div>
  );
}

storiesOf('React Grid DnD', module)
  .add('example', () => <Example />)
  .add('Drag Between', () => <DragBetweenExample />)
  .add('Drag single', () => <DragBetweenExample single />)
  .add('supports parents transforming', () => (
    <div>
      <TransformExample />
    </div>
  ));