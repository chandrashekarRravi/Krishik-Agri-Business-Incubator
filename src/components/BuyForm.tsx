import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/types";
import React, { useState, useEffect } from "react";

const buyFormSchema = yup.object({
    name: yup.string().required("Name is required").min(2, "Name must be at least 2 characters"),
    email: yup.string().required("Email is required").email("Please enter a valid email"),
    phone: yup.string().required("Phone is required").matches(/^[0-9+\-\s()]+$/, "Please enter a valid phone number"),
    quantity: yup.number().required("Quantity is required").min(1, "Quantity must be at least 1"),
    address: yup.string().required("Address is required").min(10, "Please provide a complete address")
});

export type BuyFormData = yup.InferType<typeof buyFormSchema>;

interface BuyFormProps {
    product: Product;
    onSubmit: (data: BuyFormData) => void;
    isSubmitting?: boolean;
}

export const BuyForm: React.FC<BuyFormProps> = ({ product, onSubmit, isSubmitting = false }) => {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
    const [quantity, setQuantity] = useState(1);
    const [total, setTotal] = useState(0);
    const priceNumber = Number(product.price.replace(/[^\d.]/g, ''));
    useEffect(() => {
        setTotal(quantity * priceNumber);
    }, [quantity, priceNumber]);
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue
    } = useForm<BuyFormData>({
        resolver: yupResolver(buyFormSchema),
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            address: user?.address || '',
            quantity: 1
        }
    });
    // Sync quantity state with form
    useEffect(() => {
        setValue('quantity', quantity);
    }, [quantity, setValue]);

    const whatsappUrl = `https://wa.me/91${product.contact.phone.replace(/[^0-9]/g, "")}?text=Hi,%20I%20am%20interested%20in%20buying%20the%20product:%20${encodeURIComponent(product.name)}%20(${encodeURIComponent("1")}%20units)%20for%20${encodeURIComponent(product.price)}%20from%20${encodeURIComponent(product.startup)}.%20My%20details:%20Name:%20${encodeURIComponent("")},%20Email:%20${encodeURIComponent("")},%20Phone:%20${encodeURIComponent("")},%20Address:%20${encodeURIComponent("")}`;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block font-medium mb-1" htmlFor="name">Name</label>
                    <Input
                        id="name"
                        {...register("name")}
                        className={`${errors.name ? "border-red-500" : ""}`}
                        autoComplete="name"
                    />
                    {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                </div>
                <div>
                    <label className="block font-medium mb-1" htmlFor="email">Email</label>
                    <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        className={`${errors.email ? "border-red-500" : ""}`}
                        autoComplete="email"
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                </div>
                <div>
                    <label className="block font-medium mb-1" htmlFor="phone">Phone</label>
                    <Input
                        id="phone"
                        type="tel"
                        {...register("phone")}
                        className={`${errors.phone ? "border-red-500" : ""}`}
                        autoComplete="tel"
                    />
                    {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                </div>
                <div>
                    <label className="block font-medium mb-1" htmlFor="quantity">Quantity</label>
                    <Input
                        id="quantity"
                        type="number"
                        min="1"
                        {...register("quantity", { valueAsNumber: true })}
                        value={quantity}
                        onChange={e => setQuantity(Number(e.target.value))}
                        className={`${errors.quantity ? "border-red-500" : ""}`}
                    />
                    {errors.quantity && (
                        <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>
                    )}
                </div>
            </div>
            <div className="mb-2 text-lg font-semibold text-agri-green">
                Total Amount: ₹{total}
            </div>
            <div>
                <label className="block font-medium mb-1" htmlFor="address">Shipping Address</label>
                <Textarea
                    id="address"
                    {...register("address")}
                    className={`${errors.address ? "border-red-500" : ""}`}
                    rows={3}
                />
                {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                )}
            </div>
            <div className="flex gap-4 pt-4">
                <Button
                    type="submit"
                    className="flex-1 bg-agri-green hover:bg-agri-green/90 text-lg py-3 font-semibold shadow-md"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Processing..." : "Proceed to Payment"}
                </Button>
                <Button asChild className="flex-1 bg-agri-yellow text-agri-earth-dark hover:bg-agri-yellow/90 text-lg py-3 font-semibold shadow-md">
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Buy via WhatsApp</a>
                </Button>
            </div>
        </form>
    );
}; 