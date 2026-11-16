import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useAuth } from '@/libs/hooks/useAuth';
import { deleteProject, ProjectError } from '@/libs/services/project.service';
import type { Project } from '@/libs/types/project/project';

interface DeleteProjectModalProps {
  project: Project;
  onClose: () => void;
  onDeleted: (projectId: string) => void;
  onCheckProjects: () => void;
}

export default function DeleteProjectModal({
  project,
  onClose,
  onDeleted,
  onCheckProjects,
}: DeleteProjectModalProps) {
  const { updateMember } = useAuth();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);
  const requestPending = useRef(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsCheck, setNeedsCheck] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    mounted.current = true;
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const workspace = previousFocus?.closest('main');
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    cancelRef.current?.focus();

    return () => {
      mounted.current = false;
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected && !previousFocus.matches(':disabled')) {
        previousFocus.focus({ preventScroll: true });
      } else if (workspace?.isConnected) {
        // The deleted row no longer has a button to return focus to.
        workspace.focus({ preventScroll: true });
      }
    };
  }, []);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const closeModal = () => {
    if (requestPending.current) return;
    if (needsCheck) onCheckProjects();
    else onClose();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== 'Tab') return;

    const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>(
      'button:not(:disabled)',
    );
    const first = buttons[0];
    const last = buttons[buttons.length - 1];

    if (!first || !last) {
      event.preventDefault();
    } else if (
      !Array.from(buttons).some((button) => button === document.activeElement)
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

  const doDeleteProject = async () => {
    if (requestPending.current || needsCheck) return;

    requestPending.current = true;
    setIsPending(true);
    setError(null);

    try {
      await deleteProject(project._id);
      // Remove the row only after the API confirms deletion.
      if (mounted.current) onDeleted(project._id);
    } catch (error) {
      if (!mounted.current) return;
      if (error instanceof ProjectError && error.status === 401) {
        updateMember(null);
        return;
      }
      if (error instanceof ProjectError && error.status === 404) {
        setNeedsCheck(true);
        setError(
          'This project is no longer available. Check the project list to continue.',
        );
        return;
      }

      if (
        !(error instanceof ProjectError) ||
        error.status >= 500 ||
        error.status < 400
      ) {
        setNeedsCheck(true);
        setError(
          'We couldn’t confirm whether the project was deleted. Check the project list before trying again.',
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
      aria-labelledby="delete-project-title"
      aria-describedby="delete-project-description delete-project-name"
      onKeyDown={handleKeyDown}
      onCancel={(event) => {
        event.preventDefault();
        closeModal();
      }}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[520px] overflow-y-auto rounded-[26px] border border-[#e2e7ee] bg-white p-6 text-[#243244] shadow-[0_28px_100px_rgb(9_22_42/25%)] backdrop:bg-[#101b2d]/45 backdrop:backdrop-blur-[2px] sm:p-9"
    >
      <h2
        id="delete-project-title"
        className="text-[28px] leading-tight font-semibold tracking-[-0.9px] sm:text-[32px]"
      >
        Delete project?
      </h2>
      <p
        id="delete-project-description"
        className="mt-3 text-sm leading-6 text-[#7a8592] sm:text-base"
      >
        This project will be permanently deleted. This action cannot be undone.
      </p>
      <p
        id="delete-project-name"
        className="mt-6 rounded-xl border border-[#e3e7eb] bg-[#f8f9fb] px-4 py-3 text-sm leading-6 font-medium wrap-anywhere"
      >
        {project.projectName}
      </p>

      {error && (
        <div
          ref={errorRef}
          role="alert"
          tabIndex={-1}
          className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800 outline-none"
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

      <div aria-busy={isPending} className="mt-8 flex justify-end gap-3">
        <button
          ref={cancelRef}
          type="button"
          onClick={closeModal}
          disabled={isPending}
          className="min-h-12 flex-1 rounded-xl border border-[#dfe4ea] bg-white px-5 text-sm font-medium text-[#344354] hover:bg-[#f8f9fb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#345edb] disabled:cursor-wait disabled:opacity-60 sm:flex-none"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={doDeleteProject}
          disabled={isPending || needsCheck}
          className="min-h-12 flex-1 rounded-xl bg-[#b33c50] px-5 text-sm font-medium text-white shadow-[0_4px_12px_rgb(179_60_80/12%)] hover:bg-[#992f41] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b33c50] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
        >
          {isPending ? 'Deleting…' : 'Delete project'}
        </button>
      </div>
      {isPending && (
        <p role="status" className="mt-3 text-right text-xs text-[#7a8592]">
          Deleting your project…
        </p>
      )}
    </dialog>
  );
}
