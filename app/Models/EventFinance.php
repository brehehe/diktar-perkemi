<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventFinance extends Model
{
    protected $fillable = ['event_id', 'created_by', 'type', 'category', 'description', 'sponsor_name', 'amount', 'occurred_on', 'evidence_path'];

    protected function casts(): array
    {
        return ['occurred_on' => 'date', 'amount' => 'integer'];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function categoryMaster(): BelongsTo
    {
        return $this->belongsTo(FinanceCategory::class, 'category', 'code');
    }
}
