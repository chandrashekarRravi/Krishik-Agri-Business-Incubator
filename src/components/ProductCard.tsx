import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { LazyImage } from "./LazyImage";
import type { Product } from "@/types";
import React from "react";

interface ProductCardProps {
    product: Product;
    onMoreInfo?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onMoreInfo }) => (
    <Card className="shadow-card hover:shadow-elevated transition-all duration-300 hover:scale-105">
        <CardHeader className="pb-3">
            {product.image && (
                <div className="mb-4 rounded-lg overflow-hidden bg-gray-50">
                    <LazyImage
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-contain"
                    />
                </div>
            )}
            <CardTitle className="text-lg text-agri-green leading-tight">
                {product.name}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
                <Badge
                    variant="secondary"
                    className="bg-agri-yellow-light text-agri-earth-dark text-xs"
                >
                    {product.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                    {product.startup.split(" ")[0]}
                </Badge>
            </div>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3">
                {product.description}
            </p>
            <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Quantity:</span>
                    <span className="text-muted-foreground">{product.quantity}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Price:</span>
                    <span className="text-agri-green font-semibold">{product.price}</span>
                </div>
            </div>
            <div className="flex gap-2 mt-4">
                {onMoreInfo && (
                    <Button
                        variant="default"
                        className="w-1/2 bg-agri-green hover:bg-agri-green/90"
                        onClick={() => onMoreInfo(product)}
                    >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        More Info
                    </Button>
                )}
                <Button
                    className="w-1/2 bg-agri-yellow text-agri-earth-dark hover:bg-agri-yellow/90 font-semibold"
                    asChild
                >
                    <a href={`/buy?productId=${product.id}`}>
                        Buy Now
                    </a>
                </Button>
            </div>
        </CardContent>
    </Card>
); 