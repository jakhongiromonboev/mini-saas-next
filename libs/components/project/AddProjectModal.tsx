import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type SubmitEvent,
} from 'react';
import { ProjectStatus } from '@/libs/enums/project.enum';
import { useAuth } from '@/libs/hooks/useAuth';
import { createProject, ProjectError } from '@/libs/services/project.service';
import type { MemberListItem } from '@/libs/types/member/member';
import type { Project } from '@/libs/types/project/project';
import { projectStatusLabels } from '@/libs/utils/project';

interface AddProjectModalProps {
  members: MemberListItem[];
  onClose: () => void;
  onCreated: (project: Project) => void;
  onCheckProjects: () => void;
}

interface ProjectForm {
  projectName: string;
  projectStatus: ProjectStatus;
  projectDeadline: string;
  memberId: string;
  projectBudget: string;
}

type FieldErrors = Partial<Record<keyof ProjectForm, string>>;

const inputClassName =
  'h-12 w-full min-w-0 rounded-xl border border-[#dfe4ea] bg-white px-3.5 text-base text-[#243244] shadow-[0_1px_2px_rgb(25_42_62/3%)] focus:border-[#345edb] focus:outline-none focus:ring-2 focus:ring-[#345edb]/20 disabled:opacity-60 aria-invalid:border-red-400 aria-invalid:focus:ring-red-100';

export default function AddProjectModal({
  members,
  onClose,
  onCreated,
  onCheckProjects,
}: AddProjectModalProps) {
  const { updateMember } = useAuth();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);
  const requestPending = useRef(false);
  const [input, setInput] = useState<ProjectForm>({
    projectName: '',
    projectStatus: ProjectStatus.ACTIVE,
    projectDeadline: '',
    memberId: '',
    projectBudget: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [needsCheck, setNeedsCheck] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    mounted.current = true;
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    nameRef.current?.focus();

    return () => {
      mounted.current = false;
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) {
        const focusTarget = previousFocus.matches(':disabled')
          ? previousFocus.closest('main')
          : previousFocus;
        focusTarget?.focus({ preventScroll: true });
      }
    };
  }, []);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const handleInput = <Field extends keyof ProjectForm>(
    field: Field,
    value: ProjectForm[Field],
  ) => {
    setInput((previous) => ({ ...previous, [field]: value }));
    setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const closeModal = () => {
    if (requestPending.current) return;
    if (needsCheck) onCheckProjects();
    else onClose();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== 'Tab') return;

    const controls = event.currentTarget.querySelectorAll<HTMLElement>(
      'input:not(:disabled), select:not(:disabled), button:not(:disabled)',
    );
    const first = controls[0];
    const last = controls[controls.length - 1];

    if (!first || !last) {
      event.preventDefault();
    } else if (
      !Array.from(controls).some(
        (control) => control === document.activeElement,
      )
    ) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const doCreateProject = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (requestPending.current || needsCheck) return;

    const errors: FieldErrors = {};
    const name = input.projectName.trim();
    const deadline = input.projectDeadline.trim();
    const date = new Date(deadline);
    const budget = Number(input.projectBudget);

    if (!name) errors.projectName = 'Enter a project name.';
    if (!Object.values(ProjectStatus).includes(input.projectStatus)) {
      errors.projectStatus = 'Choose a project status.';
    }
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(deadline) ||
      Number.isNaN(date.getTime()) ||
      date.toISOString() !== `${deadline}T00:00:00.000Z`
    ) {
      errors.projectDeadline = 'Choose a valid deadline.';
    }
    if (!members.some((member) => member._id === input.memberId)) {
      errors.memberId = 'Choose one member to assign.';
    }
    if (!input.projectBudget.trim() || !Number.isFinite(budget) || budget < 0) {
      errors.projectBudget = 'Enter a budget of zero or more.';
    }

    setFieldErrors(errors);
    setError(null);
    const firstInvalidField = Object.keys(errors)[0];
    if (firstInvalidField) {
      const field = formRef.current?.elements.namedItem(firstInvalidField);
      if (field instanceof HTMLElement) field.focus();
      return;
    }

    requestPending.current = true;
    setIsPending(true);

    try {
      const project = await createProject({
        projectName: name,
        projectStatus: input.projectStatus,
        projectDeadline: deadline,
        memberId: input.memberId,
        projectBudget: budget,
      });
      if (mounted.current) onCreated(project);
    } catch (error) {
      if (!mounted.current) return;
      if (error instanceof ProjectError && error.status === 401) {
        updateMember(null);
        return;
      }

      // A lost response cannot tell us whether the server saved the project.
      if (
        !(error instanceof ProjectError) ||
        error.status >= 500 ||
        error.status < 400
      ) {
        setNeedsCheck(true);
        setError(
          'We couldn’t confirm whether the project was created. Check the project list before trying again.',
        );
      } else {
        setError(error.message);
      }
    } finally {
      requestPending.current = false;
      if (mounted.current) setIsPending(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      id="add-project-dialog"
      aria-labelledby="add-project-title"
      aria-describedby="add-project-description"
      onKeyDown={handleKeyDown}
      onCancel={(event) => {
        event.preventDefault();
        closeModal();
      }}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[640px] overflow-y-auto rounded-[26px] border border-[#e2e7ee] bg-white p-6 text-[#243244] shadow-[0_28px_100px_rgb(9_22_42/25%)] backdrop:bg-[#101b2d]/45 backdrop:backdrop-blur-[2px] sm:p-9"
    >
      <h2
        id="add-project-title"
        className="text-[28px] leading-tight font-semibold tracking-[-0.9px] sm:text-[32px]"
      >
        Add project
      </h2>
      <p
        id="add-project-description"
        className="mt-3 text-sm leading-6 text-[#7a8592] sm:text-base"
      >
        Bring the details together and assign an owner.
      </p>

      <form
        ref={formRef}
        onSubmit={doCreateProject}
        noValidate
        aria-busy={isPending}
        className="mt-7"
      >
        {error && (
          <div
            ref={errorRef}
            role="alert"
            tabIndex={-1}
            className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800 outline-none"
          >
            <p>{error}</p>
            {needsCheck && (
              <button
                type="button"
                onClick={onCheckProjects}
                className="mt-2 min-h-10 rounded px-1 font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Check project list
              </button>
            )}
          </div>
        )}

        <fieldset
          disabled={isPending}
          className="grid min-w-0 gap-5 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-6"
        >
          <div className="grid min-w-0 content-start gap-2 sm:col-span-2">
            <label htmlFor="project-name" className="text-sm font-medium">
              Project name
            </label>
            <input
              ref={nameRef}
              id="project-name"
              name="projectName"
              type="text"
              required
              value={input.projectName}
              onChange={(event) =>
                handleInput('projectName', event.target.value)
              }
              aria-invalid={Boolean(fieldErrors.projectName)}
              aria-describedby={
                fieldErrors.projectName ? 'project-name-error' : undefined
              }
              className={inputClassName}
            />
            {fieldErrors.projectName && (
              <p
                id="project-name-error"
                className="text-xs leading-5 text-red-700"
              >
                {fieldErrors.projectName}
              </p>
            )}
          </div>

          <div className="grid min-w-0 content-start gap-2">
            <label htmlFor="project-status" className="text-sm font-medium">
              Status
            </label>
            <select
              id="project-status"
              name="projectStatus"
              required
              value={input.projectStatus}
              onChange={(event) =>
                handleInput(
                  'projectStatus',
                  event.target.value as ProjectStatus,
                )
              }
              aria-invalid={Boolean(fieldErrors.projectStatus)}
              aria-describedby={
                fieldErrors.projectStatus ? 'project-status-error' : undefined
              }
              className={inputClassName}
            >
              {Object.values(ProjectStatus).map((status) => (
                <option key={status} value={status}>
                  {projectStatusLabels[status]}
                </option>
              ))}
            </select>
            {fieldErrors.projectStatus && (
              <p
                id="project-status-error"
                className="text-xs leading-5 text-red-700"
              >
                {fieldErrors.projectStatus}
              </p>
            )}
          </div>

          <div className="grid min-w-0 content-start gap-2">
            <label htmlFor="project-deadline" className="text-sm font-medium">
              Deadline
            </label>
            <input
              id="project-deadline"
              name="projectDeadline"
              type="date"
              required
              value={input.projectDeadline}
              onChange={(event) =>
                handleInput('projectDeadline', event.target.value)
              }
              aria-invalid={Boolean(fieldErrors.projectDeadline)}
              aria-describedby={
                fieldErrors.projectDeadline
                  ? 'project-deadline-error'
                  : undefined
              }
              className={inputClassName}
            />
            {fieldErrors.projectDeadline && (
              <p
                id="project-deadline-error"
                className="text-xs leading-5 text-red-700"
              >
                {fieldErrors.projectDeadline}
              </p>
            )}
          </div>

          <div className="grid min-w-0 content-start gap-2">
            <label htmlFor="project-member" className="text-sm font-medium">
              Assigned member
            </label>
            <select
              id="project-member"
              name="memberId"
              required
              value={input.memberId}
              onChange={(event) => handleInput('memberId', event.target.value)}
              aria-invalid={Boolean(fieldErrors.memberId)}
              aria-describedby={
                fieldErrors.memberId ? 'project-member-error' : undefined
              }
              className={inputClassName}
            >
              <option value="" disabled>
                Select a member
              </option>
              {members.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.memberName} ({member.memberEmail})
                </option>
              ))}
            </select>
            {fieldErrors.memberId && (
              <p
                id="project-member-error"
                className="text-xs leading-5 text-red-700"
              >
                {fieldErrors.memberId}
              </p>
            )}
          </div>

          <div className="grid min-w-0 content-start gap-2">
            <label htmlFor="project-budget" className="text-sm font-medium">
              Budget (USD)
            </label>
            <input
              id="project-budget"
              name="projectBudget"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              required
              value={input.projectBudget}
              onChange={(event) =>
                handleInput('projectBudget', event.target.value)
              }
              aria-invalid={Boolean(fieldErrors.projectBudget)}
              aria-describedby={
                fieldErrors.projectBudget ? 'project-budget-error' : undefined
              }
              className={inputClassName}
            />
            {fieldErrors.projectBudget && (
              <p
                id="project-budget-error"
                className="text-xs leading-5 text-red-700"
              >
                {fieldErrors.projectBudget}
              </p>
            )}
          </div>
        </fieldset>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={closeModal}
            disabled={isPending}
            className="min-h-12 flex-1 rounded-xl border border-[#dfe4ea] bg-white px-5 text-sm font-medium text-[#344354] hover:bg-[#f8f9fb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#345edb] disabled:cursor-wait disabled:opacity-60 sm:flex-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || needsCheck}
            className="min-h-12 flex-1 rounded-xl bg-[#345edb] px-6 text-sm font-medium text-white shadow-[0_4px_12px_rgb(52_94_219/12%)] hover:bg-[#294fc1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#345edb] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
          >
            {isPending ? 'Creating project…' : 'Create project'}
          </button>
        </div>
        {isPending && (
          <p role="status" className="mt-3 text-right text-xs text-[#7a8592]">
            Saving your project…
          </p>
        )}
      </form>
    </dialog>
  );
}
