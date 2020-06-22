import { observer } from 'mobx-react';
import * as React from 'react';
import AceEditor from 'react-ace';

import { MediaTypeModel } from '../../services/models';
import { ConsoleEditorWrapper } from './ConsoleEditorWrapper';

export interface ConsoleEditorProps {
  mediaTypes: MediaTypeModel[];
}

export const ConsoleEditor = observer(
  React.forwardRef<AceEditor, ConsoleEditorProps>(({ mediaTypes }, ref) => {
    if (!mediaTypes.length) {
      return null;
    }
    const sample = mediaTypes
      .filter(media => media.name.includes('json'))
      .map(media => {
        const keys = Object.keys(media.examples ?? {});
        if (media.examples === undefined || keys.length === 0) {
          return undefined;
        }

        if ('default' in media.examples) {
          return media.examples.default;
        }
        return media.examples[keys[0]];
      })
      .find(media => media !== undefined);

    return (
      <ConsoleEditorWrapper>
        <AceEditor
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
            showLineNumbers: true,
            tabSize: 2,
            fontFamily: 'Courier,monospace',
            displayIndentGuides: false,
          }}
          fontSize={13}
          style={{
            lineHeight: '23px',
          }}
          mode="json"
          name="request-builder-editor"
          editorProps={{ $blockScrolling: true }}
          value={JSON.stringify(sample, null, 2)}
          ref={ref}
        />
      </ConsoleEditorWrapper>
    );
  }),
);
