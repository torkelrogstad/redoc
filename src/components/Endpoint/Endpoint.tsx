import * as React from 'react';
import { ShelfIcon } from '../../common-elements';
import { ClipboardService, OperationModel } from '../../services';
import { Markdown } from '../Markdown/Markdown';
import { OptionsContext } from '../OptionsProvider';
import { SelectOnClick } from '../SelectOnClick/SelectOnClick';

import { expandDefaultServerVariables, getBasePath } from '../../utils';
import {
  EndpointInfo,
  HttpVerb,
  OperationEndpointWrap,
  ServerItem,
  ServerRelativeURL,
  ServersOverlay,
  ServerUrl,
} from './styled.elements';
import { addParamsToUrl } from '../../utils/uri';
import { observer } from 'mobx-react';

export interface EndpointProps {
  operation: OperationModel;

  hideHostname?: boolean;
  inverted?: boolean;
  compact?: boolean;

  handleUrl?: (index: number) => void;
  serverIndex?: number;
}

export interface EndpointState {
  expanded: boolean;
}

@observer
export class Endpoint extends React.Component<EndpointProps, EndpointState> {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
    };
  }

  toggle = () => {
    this.setState({ expanded: !this.state.expanded });
  };

  handleUrl = (url: number) => {
    this.props.handleUrl?.(url);
    this.setState({
      expanded: false,
    });
    ClipboardService.copyCustom(this.props.operation.servers[url].url + this.props.operation.path);
  };

  render() {
    const { operation, inverted, hideHostname } = this.props;
    const { expanded } = this.state;

    const withParams = addParamsToUrl(operation, this.props.serverIndex ?? 0);
    // TODO: highlight server variables, e.g. https://{user}.test.com
    return (
      <OptionsContext.Consumer>
        {options => (
          <OperationEndpointWrap>
            <EndpointInfo onClick={this.toggle} expanded={expanded} inverted={inverted}>
              <HttpVerb type={operation.httpVerb} compact={this.props.compact}>
                {operation.httpVerb}
              </HttpVerb>
              <ServerRelativeURL>
                {decodeURIComponent(withParams.pathname) + decodeURIComponent(withParams.search)}
              </ServerRelativeURL>
              <ShelfIcon
                float={'right'}
                color={inverted ? 'black' : 'white'}
                size={'20px'}
                direction={expanded ? 'up' : 'down'}
                style={{ marginRight: '-25px' }}
              />
            </EndpointInfo>
            <ServersOverlay expanded={expanded} aria-hidden={!expanded}>
              {operation.servers.map((server, index) => {
                const normalizedUrl = options.expandDefaultServerVariables
                  ? expandDefaultServerVariables(server.url, server.variables)
                  : server.url;
                return (
                  <ServerItem
                    className={this.props.serverIndex === index ? 'selected' : ''}
                    key={normalizedUrl}
                  >
                    <Markdown
                      onSelectUrl={() => this.handleUrl(index)}
                      source={server.description || ''}
                      compact={true}
                    />
                    <SelectOnClick onSelectUrl={() => this.handleUrl(index)}>
                      <ServerUrl>
                        <span>
                          {hideHostname || options.hideHostname
                            ? getBasePath(normalizedUrl)
                            : normalizedUrl}
                        </span>
                        {operation.path}
                      </ServerUrl>
                    </SelectOnClick>
                  </ServerItem>
                );
              })}
            </ServersOverlay>
          </OperationEndpointWrap>
        )}
      </OptionsContext.Consumer>
    );
  }
}
