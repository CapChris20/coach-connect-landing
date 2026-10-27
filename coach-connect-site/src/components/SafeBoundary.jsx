// SafeBoundary.jsx — catches a crash in a decorative piece (the 3D logo, the
// 3D phone) and shows `fallback` instead, so one failed model can never blank
// the whole page.
import { Component } from 'react';

export class SafeBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasFailed: false };
  }

  static getDerivedStateFromError() {
    return { hasFailed: true };
  }

  componentDidCatch(error) {
    console.warn('A decorative piece failed to load and was skipped:', error);
  }

  render() {
    return this.state.hasFailed ? (this.props.fallback ?? null) : this.props.children;
  }
}
