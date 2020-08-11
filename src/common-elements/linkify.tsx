import * as React from 'react';

import { linkifyMixin } from './linkifyMixin';
import { StoreConsumer } from '../components/StoreBuilder';
import styled from '../styled-components';

import { HistoryService } from '../services';

const isModifiedEvent = (event) =>
  !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

export class Link extends React.Component<{ to: string; className?: string; children?: any }> {
  navigate = (history: HistoryService, event) => {
    if (
      !event.defaultPrevented && // onClick prevented default
      event.button === 0 && // ignore everything but left clicks
      !isModifiedEvent(event) // ignore clicks with modifier keys
    ) {
      event.preventDefault();
      history.replace(this.props.to);
    }
  };

  render() {
    return (
      <StoreConsumer>
        {(store) => (
          <a
            className={this.props.className}
            href={store!.menu.history.linkForId(this.props.to)}
            onClick={this.navigate.bind(this, store!.menu.history)}
          >
            {this.props.children}
          </a>
        )}
      </StoreConsumer>
    );
  }
}

const StyledShareLink = styled(Link)`
  ${linkifyMixin('&')};
`;

export function ShareLink(props: { to: string }) {
  return <StyledShareLink to={props.to} />;
}
