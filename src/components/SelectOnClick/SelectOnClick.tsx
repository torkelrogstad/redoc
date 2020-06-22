import * as React from 'react';

import { ClipboardService } from '../../services';
import styled from '../../styled-components';

export class SelectOnClick extends React.PureComponent<{
  onSelectUrl: () => void;
}> {
  private child: HTMLDivElement | null;
  selectElement = () => {
    ClipboardService.selectElement(this.child);
    this.props.onSelectUrl();
  };

  render() {
    const { children } = this.props;
    return (
      <SelectArea
        ref={el => (this.child = el)}
        onClick={this.selectElement}
        onFocus={this.selectElement}
        tabIndex={0}
        role="button"
      >
        {children}
      </SelectArea>
    );
  }
}
const SelectArea = styled.div`
  width: 80%;
`;
