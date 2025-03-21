"use client";

import { Component, type ReactNode } from "react";
import { Button } from "./ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("Error caught by error boundary:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4">
          <h2 className="text-xl font-bold text-destructive">
            Something went wrong!
          </h2>
          <Button onClick={() => this.setState({ hasError: false })}>
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
