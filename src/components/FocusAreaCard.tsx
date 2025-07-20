import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FocusArea } from "@/types";
import React from "react";

interface FocusAreaCardProps {
    area: FocusArea;
}

export const FocusAreaCard: React.FC<FocusAreaCardProps> = ({ area }) => (
    <Card className="shadow-card hover:shadow-elevated transition-all duration-300 hover:scale-105 cursor-pointer">
        <CardContent className="p-6">
            <div className="flex items-start space-x-4">
                <div className="text-3xl mb-2">{area.icon}</div>
                <div className="flex-1">
                    <h3 className="font-semibold text-lg text-agri-green mb-2">
                        {area.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        {area.description}
                    </p>
                    <div className="mt-4">
                        <Badge variant="secondary" className="bg-agri-green-light text-agri-green">
                            Innovation Area
                        </Badge>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
); 