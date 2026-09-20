import React from 'react';
import { Link } from '@inertiajs/react';

/**
 * AuthFooterLink — small text link below form (e.g. "Already have an account?")
 */
export default function AuthFooterLink({ text, linkText, href }) {
    return (
        <p className="text-center text-[12.5px] text-[#6B7C93]">
            {text}{' '}
            <Link
                href={href}
                className="font-semibold text-[#0B63CE] hover:text-[#0A3F82] hover:underline underline-offset-2 transition-colors"
            >
                {linkText}
            </Link>
        </p>
    );
}
