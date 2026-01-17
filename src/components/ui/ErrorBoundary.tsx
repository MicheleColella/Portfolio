import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
        // Error already captured in state
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="h-screen w-screen bg-black text-white flex flex-col items-center justify-center p-8 font-mono">
                    <h2 className="text-xl text-red-500 mb-4">SYSTEM_ERROR</h2>
                    <pre className="bg-zinc-900 p-4 rounded text-sm overflow-auto max-w-2xl border border-zinc-800">
                        {this.state.error?.toString()}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 px-6 py-2 border border-white hover:bg-white hover:text-black transition-colors"
                    >
                        REBOOT_SYSTEM
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
