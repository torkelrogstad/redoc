import * as React from 'react';
import AceEditor from 'react-ace';

import { FieldModel, OperationModel, SecuritySchemesModel } from '../../services/models';
import { ConsoleResponse } from '../ConsoleResponse/Response';
import { ConsoleEditor } from './ConsoleEditor';
import styled from '../../styled-components';
import { Tooltip } from '../../common-elements/Tooltip';

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
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  text-align: center;
  outline: none;
  margin: 1em 0;
  min-width: 60px;
  font-weight: bold;
  order: 1;
`;

/*
 * If we have a url like foo/bar/{uuid} uuid will be replaced with what user has typed in.
 */
const addParamsToUrl = (url: string, params: FieldModel[]): string => {
  const queryParams: { [key: string]: string } = {};
  for (const fieldModel of params) {
    if (fieldModel.in === 'path') {
      if (url.indexOf(`{${fieldModel.name}}`) > -1 && fieldModel.$value.length > 0) {
        url = url.replace(`{${fieldModel.name}}`, fieldModel.$value);
      }
    }
    if (fieldModel.in === 'query') {
      queryParams[fieldModel.name] = fieldModel.$value;
    }
  }
  const parsed = new URL(url);
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value === '') {
      return;
    }
    parsed.searchParams.append(key, value);
  });

  return parsed.toString();
};

export const ConsoleViewer: React.FC<ConsoleViewerProps> = ({
  operation,
  urlIndex,
  additionalHeaders = {},
  securitySchemes,
}) => {
  const requestBodyContent = operation.requestBody?.content;
  const hasBodySample = requestBodyContent?.hasSample;
  const mediaTypes = requestBodyContent?.mediaTypes ?? [];

  const [result, setResult] = React.useState<{
    response: Response;
    content: any;
  }>();
  const path = operation.servers[urlIndex].url + operation.path;
  const missingParameters = Array.from(path.matchAll(/{(.*?)}/gm)).map(match => match[1]);

  const consoleEditor = React.useRef<AceEditor>(null);

  const invoke = async (
    endpoint: { method: string; path: string },
    body: string | undefined,
    headers: Headers,
  ) => {
    try {
      const url = addParamsToUrl(endpoint.path, operation.parameters);
      for (const [key, value] of Object.entries(headers)) {
        headers.append(key, `${value}`);
      }

      const request = new Request(url, {
        method: endpoint.method,
        redirect: 'manual',
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const response = await fetch(request);
      const content = await response.json();
      setResult({
        response,
        content,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const onClickSend = async () => {
    let value = consoleEditor.current?.editor?.getValue();
    if (value) {
      value = JSON.parse(value);
    }
    const contentType =
      mediaTypes[requestBodyContent?.activeMimeIdx ?? 0]?.name ?? 'application/json';

    const headers: Array<string[]> = [
      ['Content-Type', contentType],
      ...securitySchemes.schemes
        .map(scheme => [scheme.id, scheme.token ?? ''])
        .filter(([, value]) => value !== ''),
      ...Object.entries(additionalHeaders),
    ];

    const endpoint = {
      method: operation.httpVerb,
      path,
    };
    return invoke(endpoint, value, new Headers(headers));
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
};

const FlexLayoutReverse = styled.div`
  align-items: flex-end;
  display: flex;
  width: 100%;
  flex-direction: row-reverse;
`;
