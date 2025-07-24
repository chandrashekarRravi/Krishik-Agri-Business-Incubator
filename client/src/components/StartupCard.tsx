import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Startup } from "@/types";
import React from "react";

interface StartupCardProps {
    startup: Startup;
    onMoreInfo?: (startup: Startup) => void;
}

export const StartupCard: React.FC<StartupCardProps> = ({ startup, onMoreInfo }) => (
    <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
        <CardHeader>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <CardTitle className="text-xl text-agri-green mb-2">
                        {startup.name}
                    </CardTitle>
                    <Badge
                        variant="secondary"
                        className="bg-agri-yellow-light text-agri-earth-dark mb-2"
                    >
                        {startup.focusArea}
                    </Badge>
                    {startup.featured && (
                        <Badge className="bg-agri-green text-white ml-2">
                            Featured
                        </Badge>
                    )}
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3">
                {startup.description}
            </p>
            <div className="flex justify-between items-center text-sm mb-2">
                <span className="font-medium">Products:</span>
                <span className="text-agri-green font-semibold">{startup.productCount}</span>
            </div>
            {onMoreInfo && (
                <button
                    className="mt-2 text-agri-green underline hover:text-agri-green/80 text-sm"
                    onClick={() => onMoreInfo(startup)}
                >
                    More Info
                </button>
            )}
        </CardContent>
    </Card>
); 