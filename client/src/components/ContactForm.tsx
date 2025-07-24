import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import React from "react";

const contactSchema = yup.object({
    name: yup.string().required("Name is required").min(2, "Name must be at least 2 characters"),
    email: yup.string().required("Email is required").email("Please enter a valid email"),
    message: yup.string().required("Message is required").min(10, "Message must be at least 10 characters")
});

type ContactFormData = yup.InferType<typeof contactSchema>;

interface ContactFormProps {
    onSubmit?: (data: ContactFormData) => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({ onSubmit }) => {
    const { toast } = useToast();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<ContactFormData>({
        resolver: yupResolver(contactSchema)
    });

    const onFormSubmit = async (data: ContactFormData) => {
        try {
            if (onSubmit) {
                await onSubmit(data);
            } else {
                // Default behavior
                toast({
                    title: "Message Sent!",
                    description: "Thank you for your message. We'll get back to you soon.",
                });
            }
            reset();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to send message. Please try again.",
                variant: "destructive"
            });
        }
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                    id="name"
                    {...register("name")}
                    className={`mt-1 ${errors.name ? "border-red-500" : ""}`}
                    placeholder="Your full name"
                />
                {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
            </div>

            <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    className={`mt-1 ${errors.email ? "border-red-500" : ""}`}
                    placeholder="your.email@example.com"
                />
                {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
            </div>

            <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                    id="message"
                    {...register("message")}
                    className={`mt-1 min-h-[120px] ${errors.message ? "border-red-500" : ""}`}
                    placeholder="Tell us about your inquiry, project ideas, or how we can help you..."
                />
                {errors.message && (
                    <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                )}
            </div>

            <Button
                type="submit"
                className="w-full bg-agri-green hover:bg-agri-green/90"
                disabled={isSubmitting}
            >
                {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
        </form>
    );
}; 