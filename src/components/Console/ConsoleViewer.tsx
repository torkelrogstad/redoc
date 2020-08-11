import * as React from 'react';
import AceEditor from 'react-ace';

import { OperationModel, SecuritySchemesModel } from '../../services/models';
import { ConsoleResponse } from '../ConsoleResponse/Response';
import { ConsoleEditor } from './ConsoleEditor';
import styled from '../../styled-components';
import { Tooltip } from '../../common-elements/Tooltip';
import { addParamsToUrl, getMissingParameters } from '../../utils/uri';
import { observer } from 'mobx-react';

export interface ConsoleViewerProps {
  operation: OperationModel;
  additionalHeaders?: object;
  securitySchemes: SecuritySchemesModel;
  urlIndex: number;
}

const SubmitButton = styled.button`
  background: ${(props) => props.theme.colors.primary.main};
  padding: 10px 30px;
  border-radius: 4px;
  color: ${(props) => props.theme.colors.text.secondary};
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  text-align: center;
  outline: none;
  margin: 1em 0;
  min-width: 60px;
  font-weight: bold;
  order: 1;
`;

export const ConsoleViewer: React.FC<ConsoleViewerProps> = observer(
  ({ operation, urlIndex, additionalHeaders = {}, securitySchemes }) => {
    const requestBodyContent = operation.requestBody?.content;
    const hasBodySample = requestBodyContent?.hasSample;
    const mediaTypes = requestBodyContent?.mediaTypes ?? [];

    const [result, setResult] = React.useState<{
      response?: Response;
      content: any;
    }>();
    const url = addParamsToUrl(operation, urlIndex);

    const missingParameters = getMissingParameters(url);

    const consoleEditor = React.useRef<AceEditor>(null);

    const invoke = async (body: string | undefined, headers: Headers) => {
      for (const [key, value] of Object.entries(headers)) {
        headers.append(key, `${value}`);
      }

      const request = new Request(url.toString(), {
        method: operation.httpVerb,
        redirect: 'manual',
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      let rawResponseBody = '';
      try {
        const response = await fetch(request);
        rawResponseBody = await response.clone().text();
        setResult({
          response,
          content: JSON.parse(rawResponseBody),
        });
      } catch (error) {
        let msg = `got error when invoking ${request.method.toUpperCase()} ${request.url}`;
        if (body) {
          msg = `${msg}, body: ${JSON.stringify(body)}`;
        }
        if (rawResponseBody) {
          msg = `${msg}, response: ${rawResponseBody}`;
        }
        console.error(msg + ':', error);

        setResult({ content: error });
      }
    };

    const onClickSend = async () => {
      let value = consoleEditor.current?.editor?.getValue();
      if (value) {
        value = JSON.parse(value);
      }
      const contentType =
        mediaTypes[requestBodyContent?.activeMimeIdx ?? 0]?.name ?? 'application/json';

      const apiKeyHeaders: Array<[string, string]> = securitySchemes.schemes
        .filter((scheme) => scheme.apiKey?.in === 'header' && scheme.token)
        .map((scheme) => [scheme.apiKey!.name, scheme.token!]);

      const headers: Array<[string, string]> = [
        ['Content-Type', contentType],
        ...apiKeyHeaders,
        ...Object.entries(additionalHeaders),
      ];

      return invoke(value, new Headers(headers));
    };

    const [invalidJsonInput, setInvalidJsonInput] = React.useState(false);
    React.useEffect(() => {
      consoleEditor.current?.editor.addEventListener('change', () => {
        try {
          const editorValue = consoleEditor.current?.editor.getValue() ?? '';
          if (editorValue) {
            JSON.parse(editorValue);
          }
        } catch (e) {
          setInvalidJsonInput(true);
        }
      });
    }, [consoleEditor]);

    const hasMissingParams = missingParameters.length !== 0;
    let toolTip = '';
    if (hasMissingParams) {
      toolTip = `Missing path parameters: ${missingParameters.join(', ')}`;
    }
    if (invalidJsonInput) {
      toolTip = 'Body is invalid JSON';
    }

    return (
      <div>
        <h3> Request </h3>
        {hasBodySample && <ConsoleEditor mediaTypes={mediaTypes} ref={consoleEditor} />}
        <FlexLayoutReverse>
          <Tooltip title={toolTip} open={hasMissingParams || invalidJsonInput}>
            <SubmitButton disabled={hasMissingParams || invalidJsonInput} onClick={onClickSend}>
              Send Request
            </SubmitButton>
          </Tooltip>
        </FlexLayoutReverse>
        {result && <ConsoleResponse content={result.content} response={result.response} />}
      </div>
    );
  },
);

const FlexLayoutReverse = styled.div`
  align-items: flex-end;
  display: flex;
  width: 100%;
  flex-direction: row-reverse;
`;
