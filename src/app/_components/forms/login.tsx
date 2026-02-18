"use client"
import Link from "next/link";
import { z } from "zod";
import type { User } from "@/app/@types/formTypes";
import { useForm, type AnyFieldApi } from "@tanstack/react-form-nextjs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/server/better-auth/client";

const defaultUser: Pick<User, "email" | "password"> = {
  email: "",
  password: "",
};

const signinSchema = z.object({
  email: z.string().email("Must be a valid email"),
  password: z
    .string()
    .min(8, "Should be at least 8 characters")
    .max(10, "Cant be more than 10 characters"),
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

export function LoginForm() {
  const form = useForm({
    defaultValues: defaultUser,
    validators: {
      onDynamic: signinSchema,
      onChange: signinSchema
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email({
        email: value.email,
        password: value.password,
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
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}>
            <FieldGroup>
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
              <Field>
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit, isSubmitting]) => (
                    <>
                      <Button
                        type="submit"
                        disabled={!canSubmit || isSubmitting}
                      >
                        Login
                      </Button>
                    </>
                  )}
                />
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <Link href="/signup">Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
