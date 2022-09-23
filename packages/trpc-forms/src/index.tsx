import { TRPCClientErrorLike } from "@trpc/client";
import type { DecorateProcedure, UseTRPCMutationOptions } from "@trpc/react/shared";
import type {
  AnyMutationProcedure,
  inferProcedureInput,
  inferProcedureOutput,
} from "@trpc/server";
import { type UseFormProps, useForm } from "react-hook-form";

type OmitNullish<TType> = Omit<TType, "undefined" | "null">;

export const useTRPCForm = <
  TProcedure extends AnyMutationProcedure,
  TInput = inferProcedureInput<TProcedure>
>(
  mutation: DecorateProcedure<TProcedure, "">,
  mutationOpts?: UseTRPCMutationOptions<
    TInput,
    TRPCClientErrorLike<TProcedure>,
    inferProcedureOutput<TProcedure>
  >,
  formOpts?: UseFormProps<OmitNullish<TInput>>
) => {
  const form = useForm<OmitNullish<TInput>>(formOpts);

  const actions = mutation.useMutation({
    ...mutationOpts,
    onError(error) {
      console.error("onError", error.message);
      // TODO: handle errors
      console.log("errors before", form.formState.errors);
      // @ts-expect-error
      form.setError("body", { type: "manual", message: error.message });
      console.log("errors after", form.formState.errors);
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    console.log(data);
    actions.mutate(form.getValues());
  });

  return {
    ...form,
    handleSubmit,
  };
};
