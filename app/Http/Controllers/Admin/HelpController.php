<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class HelpController extends Controller
{
    /**
     * Display the administration guides and FAQ.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Help/Index');
    }
}
