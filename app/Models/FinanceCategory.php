<?php

namespace App\Models;

use Database\Factories\FinanceCategoryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FinanceCategory extends Model
{
    /** @use HasFactory<FinanceCategoryFactory> */
    use HasFactory;

    protected $fillable = ['code', 'name', 'transaction_type', 'sort_order'];

    protected function casts(): array
    {
        return ['sort_order' => 'integer'];
    }

    public function finances(): HasMany
    {
        return $this->hasMany(EventFinance::class, 'category', 'code');
    }
}
