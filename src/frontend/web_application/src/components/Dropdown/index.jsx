import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { getOffset } from './services/getOffset';
import './style.scss';

const CONTROL_PREFIX = 'toggle';

export const withDropdownControl = (WrappedComponent) => {
  const WithDropdownControl = ({ toggleId, className, ...props }) => {
    const triggerClassName = classnames(
      'm-dropdown__trigger',
      className,
    );
    const id = `${CONTROL_PREFIX}-${toggleId}`;

    return (
      <WrappedComponent
        id={id}
        className={triggerClassName}
        role="button"
        tabIndex="0"
        {...props}
      />
    );
  };

  WithDropdownControl.propTypes = {
    className: PropTypes.string,
    toggleId: PropTypes.string.isRequired,
  };
  WithDropdownControl.defaultProps = {
    className: null,
  };
  WithDropdownControl.displayName = `WithDropdownControl(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithDropdownControl;
};


class Dropdown extends Component {

  static propTypes = {
    id: PropTypes.string.isRequired,
    alignRight: PropTypes.bool, // force align right
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    className: PropTypes.string,
    closeOnClick: PropTypes.bool, // should Dropdown close on click?
    // closeOnClickExceptRefs: array of refs that should not close dropdown on click
    // usage:
    // <div ref={foo => this.foo =foo} />
    // <Dropdown closeOnClickExceptRefs={[this.foo]} />
    closeOnClickExceptRefs: PropTypes.arrayOf(PropTypes.shape({})),
    isMenu: PropTypes.bool,
    position: PropTypes.oneOf(['top', 'bottom']),
    onToggle: PropTypes.func,
    show: PropTypes.bool,
  };

  static defaultProps = {
    alignRight: false,
    children: null,
    className: null,
    closeOnClick: false,
    closeOnClickExceptRefs: null,
    position: 'bottom',
    isMenu: false,
    onToggle: str => str,
    show: false,
  };

  state = {
    isOpen: false,
    offset: {},
  };

  componentDidMount() {
    this.dropdownControl = document.getElementById(`${CONTROL_PREFIX}-${this.props.id}`);

    this.handleDocumentClick = (ev) => {
      const target = ev.target;
      const exceptRefs = this.props.closeOnClickExceptRefs;

      const dropdownClick = !this.props.closeOnClick &&
        (this.dropdown === target || this.dropdown.contains(target));

      const exeptRefsClick = exceptRefs &&
        exceptRefs.find(ref => (ref === target));

      const controlClick = this.dropdownControl &&
        (this.dropdownControl === target || this.dropdownControl.contains(target));

      if (controlClick) {
        this.toggle(!this.state.isOpen);

        return;
      }
      if (dropdownClick) { return; }
      if (exeptRefsClick) { return; }

      this.toggle(false);
    };

    this.toggle(this.props.show);
    document.addEventListener('click', this.handleDocumentClick);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.show !== nextProps.show) {
      this.toggle(nextProps.show);
    }
  }

  componentWillUnmount() {
    if (this.handleDocumentClick) {
      document.removeEventListener('click', this.handleDocumentClick);
    }
    if (this.handleWindowScroll) {
      window.removeEventListener('scroll', this.handleWindowScroll);
    }
  }

  toggle = (isVisible) => {
    this.setState((prevState) => {
      // update offset only if prevState.isOpen is false
      // otherwise return prevState.offset
      const newOffset = prevState.isOpen ? prevState.offset : this.updateOffset();

      if (isVisible !== prevState.isOpen) { this.props.onToggle(isVisible); }

      return {
        isOpen: isVisible !== prevState.isOpen && isVisible,
        offset: isVisible ? newOffset : { top: null, left: null },
      };
    });
  }

  updateOffset = () => {
    const { alignRight, position } = this.props;
    const control = this.dropdownControl;
    const dropdown = this.dropdown;

    // if no dropdownControl declared, return empty offset
    // otherwise, return new offset
    return control ? getOffset(alignRight, position, control, dropdown) : {};
  }

  render() {
    const { id, className, children, isMenu } = this.props;

    const dropdownOffset = {
      top: this.dropdownControl ? this.state.offset.top || 0 : null,
      left: this.dropdownControl ? this.state.offset.left || 0 : null,
    };

    const dropdownProps = {
      id,
      className: classnames(
        'm-dropdown',
        { 'm-dropdown--is-open': this.state.isOpen },
        { 'm-dropdown--is-menu': isMenu },
        className,
      ),
      tabIndex: 0,
      role: 'presentation',
      style: dropdownOffset,
    };

    return (
      <div ref={(node) => { this.dropdown = node; }} {...dropdownProps}>
        {children}
      </div>
    );
  }
}

export default Dropdown;
