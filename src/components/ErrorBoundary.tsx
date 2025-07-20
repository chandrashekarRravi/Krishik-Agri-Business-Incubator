import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="text-center p-8">
                        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-foreground mb-4">
                            Something went wrong
                        </h1>
                        <p className="text-muted-foreground mb-6 max-w-md">
                            We're sorry, but something unexpected happened. Please try refreshing the page.
                        </p>
                        <div className="space-x-4">
                            <Button onClick={this.handleReload} className="bg-agri-green hover:bg-agri-green/90">
                                Reload Page
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => window.history.back()}
                            >
                                Go Back
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
} 