"use client";
import { z } from "zod";
import Link from "next/link";
import type { User } from "@/app/@types/formTypes";
import { useForm, type AnyFieldApi } from "@tanstack/react-form-nextjs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { authClient } from "@/server/better-auth/client";
import { redirect } from "next/navigation";

const defaultUser: User = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  phonenumber: "",
  countrycode: "",
};

const signupSchema = z.object({
  firstName: z
    .string()
    .min(2, "Should be at least 2 characters")
    .max(10, "Cant be more than 10 characters"),
  lastName: z
    .string()
    .min(2, "Should be at least 2 characters")
    .max(10, "Cant be more than 10 characters"),
  email: z.string().email("Must be a valid email"),
  password: z
    .string()
    .min(8, "Should be at least 8 characters")
    .max(10, "Cant be more than 10 characters"),
  confirmPassword: z
    .string()
    .min(8, "Should be at least 8 characters")
    .max(10, "Cant be more than 10 characters"),
  phonenumber: z
    .string()
    .min(10, "Must be a valid contact number")
    .max(15, "Must be a valid contact number"),
  countrycode: z.string().min(2).max(4),
});

signupSchema.refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

function FieldInfo({
  field,
  className,
}: {
  field: AnyFieldApi;
  className?: string;
}) {
  if (!field.state.meta.isTouched && !field.state.meta.isValidating)
    return null;

  return (
    <div className={cn("absolute top-full left-0 mt-1 w-full", className)}>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <FieldError className="text-xs">
          {field.state.meta.errors.map((e: any) => e?.message ?? e).join(", ")}
        </FieldError>
      ) : null}
      {field.state.meta.isValidating ? (
        <p className="text-muted-foreground text-xs">Validating...</p>
      ) : null}
    </div>
  );
}

export function SignupForm() {
  const form = useForm({
    defaultValues: defaultUser,
    validators: {
      onChange: signupSchema,
      onSubmit: signupSchema,
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email({
        email: value.email,
        password: value.password,
        name: value.firstName + " " + value.lastName,
        phone: value.phonenumber,
        countryCode: value.countrycode,
        fetchOptions: {
          onSuccess: () => {
            redirect("/dashboard");
          },
          onError: (error) => {
            console.log(error);
          },
        },
      });
    },
  });
  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card>
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>
            Enter your email below to sign up for an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
            className="flex flex-col gap-4"
          >
            <FieldGroup className="flex flex-col gap-4">
              <div className="flex gap-4">
                <Field className="flex-1">
                  <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                  <form.Field
                    name="firstName"
                    children={(field) => (
                      <div className="relative">
                        <Input
                          id="firstName"
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          type="text"
                          placeholder="John"
                          required
                          autoComplete="given-name"
                          className="bg-white"
                        />
                        <FieldInfo field={field} />
                      </div>
                    )}
                  />
                </Field>
                <Field className="flex-1">
                  <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                  <form.Field
                    name="lastName"
                    children={(field) => (
                      <div className="relative">
                        <Input
                          id="lastName"
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          type="text"
                          placeholder="Doe"
                          required
                          autoComplete="family-name"
                          className="bg-white"
                        />
                        <FieldInfo field={field} />
                      </div>
                    )}
                  />
                </Field>
              </div>
              <Field className="my-1 flex gap-2">
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <form.Field
                  name="email"
                  children={(field) => (
                    <div className="relative">
                      <Input
                        id="email"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        type="email"
                        placeholder="m@example.com"
                        required
                        autoComplete="email"
                        className="h-10 bg-white"
                      />
                      <FieldInfo field={field} />
                    </div>
                  )}
                />
              </Field>
              <Field className="my-1 flex gap-2">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <form.Field
                  name="password"
                  children={(field) => (
                    <div className="relative">
                      <Input
                        id="password"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        type="password"
                        autoComplete="new-password"
                        className="h-10 bg-white"
                        required
                      />
                      <FieldInfo field={field} />
                    </div>
                  )}
                />
              </Field>
              <Field className="my-1 flex gap-2">
                <FieldLabel htmlFor="confirmPassword">
                  Confirm Password
                </FieldLabel>
                <form.Field
                  name="confirmPassword"
                  children={(field) => (
                    <div className="relative h-10">
                      <Input
                        id="confirmPassword"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        type="password"
                        autoComplete="new-password"
                        className="h-10 bg-white"
                        required
                      />
                      <FieldInfo field={field} />
                    </div>
                  )}
                />
              </Field>
              <Field className="my-1 flex gap-2">
                <FieldLabel htmlFor="contact">Contact Number</FieldLabel>
                <form.Field
                  name="phonenumber"
                  children={(field) => (
                    <div className="relative">
                      <PhoneInput
                        id="phonenumber"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(value) => field.handleChange(value)}
                        autoComplete="tel"
                        className="h-max rounded-md bg-white"
                        required
                      />
                      <FieldInfo field={field} />
                    </div>
                  )}
                />
              </Field>
              <Field className="my-1 flex gap-2">
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit, isSubmitting]) => (
                    <>
                      <Button
                        type="submit"
                        disabled={!canSubmit || isSubmitting}
                        variant="default"
                      >
                        Login
                      </Button>
                    </>
                  )}
                />
              </Field>
            </FieldGroup>
          </form>
          <CardFooter className="w-full justify-center py-2">
            Do you have an account?
            <Link
              href="/login"
              className="text-primary ml-2 underline-offset-4 hover:underline"
            >
              Login
            </Link>
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
}
