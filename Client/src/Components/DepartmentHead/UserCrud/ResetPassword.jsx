import React, { useState } from 'react'
import { useDispatch } from 'react-redux'

import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose
} from "@/Components/ui/dialog"
import { Button } from "@/Components/ui/button"
import { RotateCcw } from 'lucide-react'
import { resetPassword } from '@/Store/UsersDataSlice'

const ResetPassword = ({ userId }) => {
    console.log(userId)
    const dispatch = useDispatch()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const ResetPasswordHandler = async () => {
        if (!userId) {
            toast.error("User ID is missing");
            return;
        }

        setIsLoading(true);
        try {
            const resultAction = await dispatch(resetPassword(userId));
            if (resetPassword.fulfilled.match(resultAction)) {
                toast.success("Password reset successfully");
                setIsDialogOpen(false);
            } else {
                if (resultAction.payload) {
                    toast.error(resultAction.payload.message);
                } else {
                    toast.error(resultAction.error.message || "Failed to reset password");
                }
            }
        } catch (err) {
            toast.error("An unexpected error occurred");
            console.error("Failed to reset password: ", err);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <button
                className="p-1 text-blue-100 hover:text-blue-300 cursor-pointer"
                onClick={() => setIsDialogOpen(true)}
                title="Reset Password"
            >
                <RotateCcw />
            </button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className='bg-(--two)'>
                    <DialogHeader>
                        <DialogTitle>Password Reset</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to reset the password for this user?
                            The password will be reset to the default: <strong>Osu@1234</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isLoading}>Cancel</Button>
                        </DialogClose>
                        <Button onClick={ResetPasswordHandler} disabled={isLoading}>
                            {isLoading ? "Resetting..." : "Confirm Reset"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ResetPassword