import * as React from 'react';
import { RightPanelHeader } from '../../common-elements';
import styled from '../../styled-components';

import { JsonViewer } from '../JsonViewer/JsonViewer';

interface ConsoleResponseProps {
  response?: Response;
  content: any;
}

const Italic = styled.span`
  font-style: italic;
  padding: 1em;
`;

const LightItalic = styled.span`
  font-style: italic;
  font-size: 70%;
  font-weight: lighter;
  margin-left: 1em;
`;

const Pre = styled.pre`
  padding: 1em;
`;

export const ConsoleResponse: React.FC<ConsoleResponseProps> = ({ response, content }) => {
  const { type = 'error', status = 500, statusText, headers } = response ?? {};
  const [collapse, setCollapse] = React.useState(false);

  const renderAbleHeaders =
    headers !== undefined ? (
      <Pre>
        {Array.from(headers.entries())
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n')}
      </Pre>
    ) : (
      <Italic>no headers found</Italic>
    );

  let jsonContent = content;
  if (content instanceof Error) {
    jsonContent = content.message;
  }
  return (
    <>
      <RightPanelHeader> status: </RightPanelHeader>
      <StatusWrapper className={'status-' + type}>
        {' '}
        {status} {statusText}
      </StatusWrapper>
      <RightPanelHeader> Response Payload </RightPanelHeader>
      <JsonWrapper>
        <JsonViewer data={jsonContent} />
      </JsonWrapper>
      <RightPanelHeader>
        Response Headers
        <LightItalic>(Only the ones CORS let us read)</LightItalic>
      </RightPanelHeader>
      <HeaderWrapper>
        <SourceCodeWrapper className={'collapse-' + collapse}>
          {renderAbleHeaders}
        </SourceCodeWrapper>
        {collapse && (
          <ShowMore onClick={() => setCollapse(!collapse)}>
            <u>+ show undocumented response headers</u>
          </ShowMore>
        )}
      </HeaderWrapper>
    </>
  );
};

const HeaderWrapper = styled.div`
  color: white;
  background-color: ${props => props.theme.codeBlock.backgroundColor};
  padding: 10px 0 18px;
  margin: 10px 0;
  height: 100%;
  div div div {
    display: none !important;
  }
  div pre span:first-child {
    display: none !important;
  }
  div pre span:last-child {
    display: none !important;
  }
  div pre {
    height: 100%;
    overflow: hidden;
  }
  div {
    height: 100%;
  }
`;

const SourceCodeWrapper = styled.div`
  &.collapse-false {
    height: 89px;
  }
  &.collapse-true {
    height: auto;
  }
`;

const JsonWrapper = styled.div`
  color: white;
  background-color: ${props => props.theme.codeBlock.backgroundColor};
  padding: 10px;
  margin: 10px 0;
`;

const StatusWrapper = styled.div`
  &.status-success {
    color: #00ff1c;
  }
  &.status-redirect {
    color: ${props => props.theme.colors.responses.redirect.color};
  }
  &.status-info {
    color: ${props => props.theme.colors.responses.info.color};
  }
  &.status-error {
    color: ${props => props.theme.colors.responses.error.color};
  }
  color: white;
  background-color: ${props => props.theme.codeBlock.backgroundColor};
  padding: 10px;
  margin: 10px 0;
`;

const ShowMore = styled.div`
  text-align: center;
  u {
    cursor: pointer;
  }
`;
