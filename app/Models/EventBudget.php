<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventBudget extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'created_by',
        'type',
        'category',
        'item_name',
        'quantity',
        'unit',
        'unit_price',
        'amount',
        'notes',
        'sort_order',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity' => 'float',
            'unit_price' => 'integer',
            'amount' => 'integer',
            'sort_order' => 'integer',
        ];
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
