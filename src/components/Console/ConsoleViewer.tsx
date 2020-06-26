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
  queryParamPrefix?: string;
  queryParamSuffix?: string;
  securitySchemes: SecuritySchemesModel;
  urlIndex: number;
}

const SubmitButton = styled.button`
  background: ${props => props.theme.colors.primary.main};
  padding: 10px 30px;
  border-radius: 4px;
  color: ${props => props.theme.colors.text.secondary};
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
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

      try {
        const response = await fetch(request);
        const content = await response.json();
        setResult({
          response,
          content,
        });
      } catch (error) {
        console.error(
          `got error when invoking ${request.method.toUpperCase()} ${request.url}:`,
          error,
        );

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
        .filter(scheme => scheme.apiKey?.in === 'header' && scheme.token)
        .map(scheme => [scheme.apiKey!.name, scheme.token!]);

      const headers: Array<[string, string]> = [
        ['Content-Type', contentType],
        ...apiKeyHeaders,
        ...Object.entries(additionalHeaders),
      ];

      return invoke(value, new Headers(headers));
    };

    return (
      <div>
        <h3> Request </h3>
        {hasBodySample && <ConsoleEditor mediaTypes={mediaTypes} ref={consoleEditor} />}
        <FlexLayoutReverse>
          <Tooltip
            title={`Missing path parameters: ${missingParameters.join(', ')}`}
            open={missingParameters.length !== 0}
          >
            <SubmitButton disabled={missingParameters.length !== 0} onClick={onClickSend}>
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
