import { observer } from 'mobx-react';
import * as React from 'react';

import { Badge, DarkRightPanel, H2, MiddlePanel, Row } from '../../common-elements';
import { ShareLink } from '../../common-elements/linkify';
import { OperationModel as OperationType, SecuritySchemesModel } from '../../services/models';
import styled from '../../styled-components';
import { CallbacksList } from '../Callbacks';
import { CallbackSamples } from '../CallbackSamples/CallbackSamples';
import { Endpoint } from '../Endpoint/Endpoint';
import { ExternalDocumentation } from '../ExternalDocumentation/ExternalDocumentation';
import { Extensions } from '../Fields/Extensions';
import { Markdown } from '../Markdown/Markdown';
import { OptionsContext } from '../OptionsProvider';
import { Parameters } from '../Parameters/Parameters';
import { RequestSamples } from '../RequestSamples/RequestSamples';
import { ResponsesList } from '../Responses/ResponsesList';
import { ResponseSamples } from '../ResponseSamples/ResponseSamples';
import { SecurityRequirements } from '../SecurityRequirement/SecurityRequirement';
import { ConsoleViewer } from '../Console/ConsoleViewer';
import { interactiveStore } from '../../services/InteractiveStore';
import { SwitchBox } from '../../common-elements/SwitchBox';

const OperationRow = styled(Row)`
  backface-visibility: hidden;
  contain: content;
  overflow: hidden;
`;

const Description = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.unit * 6}px;
`;

export interface OperationProps {
  operation: OperationType;
  securitySchemes: SecuritySchemesModel;
}

@observer
export class Operation extends React.Component<OperationProps> {
  state = {
    urlIndex: 0,
  };
  render() {
    const { operation, securitySchemes } = this.props;

    const { name: summary, description, deprecated, externalDocs } = operation;
    const hasDescription = !!(description || externalDocs);
    const active = interactiveStore.active.get();

    return (
      <OptionsContext.Consumer>
        {options => (
          <OperationRow>
            <MiddlePanel>
              <H2>
                <ShareLink to={operation.id} />
                {summary} {deprecated && <Badge type="warning"> Deprecated </Badge>}
              </H2>
              {options.enableConsole && (
                <SwitchBox
                  onClick={interactiveStore.toggleActive}
                  checked={interactiveStore.active.get()}
                  label="Try it out!"
                />
              )}
              {options.pathInMiddlePanel && <Endpoint operation={operation} inverted={true} />}
              {hasDescription && (
                <Description>
                  {description !== undefined && <Markdown source={description} />}
                  {externalDocs && <ExternalDocumentation externalDocs={externalDocs} />}
                </Description>
              )}
              <Extensions extensions={operation.extensions} />
              <SecurityRequirements securities={operation.security} />
              <Parameters parameters={operation.parameters} body={operation.requestBody} />
              <ResponsesList responses={operation.responses} />
              <CallbacksList callbacks={operation.callbacks} />
            </MiddlePanel>
            <DarkRightPanel>
              {/* TODO: change URL dynamically with entered information if in editing mode */}
              {!options.pathInMiddlePanel && (
                <Endpoint
                  serverIndex={this.state.urlIndex}
                  operation={operation}
                  handleUrl={index => this.setState({ urlIndex: index })}
                />
              )}
              {active && (
                <div>
                  <ConsoleViewer
                    urlIndex={this.state.urlIndex}
                    securitySchemes={securitySchemes}
                    operation={operation}
                    additionalHeaders={options.additionalHeaders}
                  />
                </div>
              )}
              {!active && <RequestSamples operation={operation} />}
              {!active && <ResponseSamples operation={operation} />}
              {!active && <CallbackSamples callbacks={operation.callbacks} />}
            </DarkRightPanel>
          </OperationRow>
        )}
      </OptionsContext.Consumer>
    );
  }
}
