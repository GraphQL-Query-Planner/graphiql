import React from 'react';
import PropTypes from 'prop-types';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

export class PluginsPane extends React.Component {
  static propTypes = {
    plugins: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string.isRequired,
        plugin: PropTypes.any.isRequired,
      }),
    ),
    value: PropTypes.string,
  };

  constructor() {
    super();
    this.state = {
      pluginsPaneOpen: true,
      pluginsPaneHeight: this.OFFEST,
    };
    this.OFFEST = 29;
    this.OFFSET_HEIGHT = `${this.OFFEST}px`;
    this.handleResizeStart = this.handleResizeStart.bind(this);
  }

  componentDidMount() {
    this.hidePluginsPane();
  }

  render() {
    const style = {
      height: this.state.pluginsPaneOpen
        ? this.state.pluginsPaneHeight
        : this.OFFSET_HEIGHT,
    };

    if (this.state.pluginsPaneOpen === false) {
      this.hidePluginsPane();
    }

    return (
      <div className="plugins-pane" style={style}>
        <div
          className="plugins-pane__title variable-editor-title"
          style={{
            cursor: this.state.pluginsPaneOpen ? 'row-resize' : 'n-resize',
          }}
          onMouseDown={this.handleResizeStart}>
          {'Plugins'}
        </div>

        <Tabs>
          {this.tabList()}
          {this.tabPanels()}
        </Tabs>
      </div>
    );
  }

  tabList() {
    const tabs = this.props.plugins.map((plugin, id) =>
      <Tab key={id}> {plugin.title} </Tab>,
    );
    return <TabList>{tabs}</TabList>;
  }

  tabPanels() {
    const tabs = this.props.plugins.map((aPlugin, id) => {
      const { props } = aPlugin.plugin;
      const error = <div> {'Plugin does not include a render prop'}</div>;
      const view = props.render ? props.render(this.props.value) : error;

      return (
        <TabPanel key={id}>
          {view}
        </TabPanel>
      );
    });
    return tabs;
  }

  handleResizeStart(downEvent) {
    downEvent.preventDefault();

    let didMove = false;
    const wasOpen = this.state.pluginsPaneOpen;
    const hadHeight = this.state.pluginsPaneHeight;
    const offset = downEvent.clientY - getTop(downEvent.target);

    let onMouseUp = () => {
      if (!didMove) {
        this.setState({ pluginsPaneOpen: !wasOpen });
      }

      if (wasOpen && !didMove) {
        this.hidePluginsPane();
      } else {
        this.showPluginsPane();
      }

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      onMouseMove = null;
      onMouseUp = null;
    };

    let onMouseMove = moveEvent => {
      if (moveEvent.buttons === 0) {
        return onMouseUp();
      }

      didMove = true;

      const editorBar = document.querySelector('.editorBar');
      const topSize = moveEvent.clientY - getTop(editorBar) - offset;
      const bottomSize = editorBar.clientHeight - topSize - this.OFFEST;

      if (bottomSize < 60) {
        this.setState({
          pluginsPaneOpen: false,
          pluginsPaneHeight: hadHeight,
        });
        this.hidePluginsPane();
      } else {
        this.setState({
          pluginsPaneOpen: true,
          pluginsPaneHeight: bottomSize,
        });
        this.showPluginsPane();
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  hidePluginsPane() {
    const reactTabs = document.querySelector('div.plugins-pane div.react-tabs');
    if (reactTabs) {
      reactTabs.style.display = 'none';
    }
  }
  showPluginsPane() {
    const reactTabs = document.querySelector('div.plugins-pane div.react-tabs');
    if (reactTabs) {
      reactTabs.style.display = 'block';
    }
  }
}

function getTop(initialElem) {
  let pt = 0;
  let elem = initialElem;
  while (elem.offsetParent) {
    pt += elem.offsetTop;
    elem = elem.offsetParent;
  }
  return pt;
}
